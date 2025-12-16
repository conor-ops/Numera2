import { APP_CONFIG } from '../config';

// Use relative path to leverage Firebase Hosting rewrites
const STRIPE_ENDPOINT = '/api/createStripeCheckoutSession';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Initiates the checkout process via Stripe (Backend managed).
 */
export const initiateCheckout = async (amount: number, currency: string = 'USD'): Promise<PaymentResult> => {
  console.log(`[PaymentService] Initiating Stripe checkout for ${currency} ${amount.toFixed(2)}`);

  try {
    const response = await fetch(STRIPE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        returnUrl: window.location.href.split('?')[0] // Current URL without query params
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate checkout session');
    }

    const data = await response.json();

    if (data.url) {
      // Redirect to Stripe hosted checkout
      window.location.href = data.url;
      // We return a pending promise that never resolves here because the page unloads
      return new Promise(() => {});
    } else {
      throw new Error('No checkout URL returned');
    }

  } catch (error) {
    console.error('Payment Error:', error);
    return { success: false, error: 'Failed to connect to payment provider.' };
  }
};

export const getFormattedPrice = () => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: APP_CONFIG.pricing.currency
  }).format(APP_CONFIG.pricing.annualPrice);
};
