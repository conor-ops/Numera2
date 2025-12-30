import { APP_CONFIG } from '../config';

// Direct Stripe Payment Link
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/3cI28saXW5BS6SoaOT1RC02';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Initiates the checkout process via Cloud Function.
 */
export const initiateCheckout = async (
  amount: number, 
  currency: string = 'USD',
  planType: 'pro' | 'business' = 'pro',
  invoiceId?: string
): Promise<PaymentResult> => {
  console.log(`[PaymentService] Initiating ${planType} checkout session`);

  try {
    const response = await fetch('/api/createStripeCheckoutSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        planType,
        invoiceId,
        returnUrl: window.location.origin
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const { url } = await response.json();
    
    // Redirect to the Stripe Checkout page
    if (url) {
      window.location.href = url;
      return { success: true };
    } else {
      throw new Error("No checkout URL returned from server");
    }
  } catch (error: any) {
    console.error('Payment Error:', error);
    return { success: false, error: error.message || 'Failed to initiate payment.' };
  }
};

export const getFormattedPrice = () => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: APP_CONFIG.pricing.currency
  }).format(APP_CONFIG.pricing.annualPrice);
};
