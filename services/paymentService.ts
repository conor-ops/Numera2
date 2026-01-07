import { APP_CONFIG } from '../config';

// Direct Stripe Payment Links (Plan Specific)
const STRIPE_LINKS = {
  pro: 'https://buy.stripe.com/dRm6oI0ji6FW1y4aOT1RC03',
  business: 'https://buy.stripe.com/4gMbJ20jiggwdgM0af1RC04'
};

// Direct v2 Cloud Function URL (Primary)
const CHECKOUT_ENDPOINT = '/api/createStripeCheckoutSession';
const CHECKOUT_ENDPOINT_DIRECT = 'https://createstripecheckoutsession-4di2enm25a-uc.a.run.app';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Initiates the checkout process.
 * Tries dynamic checkout first, falls back to specific hardcoded plan link.
 */
export const initiateCheckout = async (
  amount: number, 
  currency: string = 'USD',
  planType: 'pro' | 'business' = 'pro',
  invoiceId?: string
): Promise<PaymentResult> => {
  console.log(`[PaymentService] Initiating ${planType} checkout`);

  const payload = { amount, currency, planType, invoiceId, returnUrl: window.location.origin };

  try {
    // 1. Try Dynamic Checkout (Best for tracking)
    let response = await fetch(CHECKOUT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      response = await fetch(CHECKOUT_ENDPOINT_DIRECT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (response.ok) {
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
        return { success: true };
      }
    }
    
    // 2. Fallback to specific hardcoded link if API fails
    console.warn("[PaymentService] API checkout failed, using plan-specific fallback link.");
    window.location.href = STRIPE_LINKS[planType] || STRIPE_LINKS.pro;
    return { success: true };

  } catch (error: any) {
    console.warn('[PaymentService] Network error, using fallback link.', error);
    window.location.href = STRIPE_LINKS[planType] || STRIPE_LINKS.pro;
    return { success: true };
  }
};

export const getFormattedPrice = () => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: APP_CONFIG.pricing.currency
  }).format(APP_CONFIG.pricing.annualPrice);
};
