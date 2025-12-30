<<<<<<<< HEAD:src/services/paymentService.ts
import { APP_CONFIG } from '@/config/constants';
import { Capacitor } from '@capacitor/core';
import { loadStripe } from '@stripe/stripe-js';
========
import { APP_CONFIG } from '../config';

// Direct Stripe Payment Link
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/3cI28saXW5BS6SoaOT1RC02';
>>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a:services/paymentService.ts

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

<<<<<<<< HEAD:src/services/paymentService.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  duration?: string;
  interval?: string;
}

let stripePromise: ReturnType<typeof loadStripe> | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    stripePromise = loadStripe(APP_CONFIG.stripe.publicKey);
  }
  return stripePromise;
};

========
>>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a:services/paymentService.ts
/**
 * Initiates the checkout process via Stripe Payment Link.
 * Opens in new tab to keep current app state.
 */
export const initiateCheckout = async (amount: number, currency: string = 'USD'): Promise<PaymentResult> => {
  console.log(`[PaymentService] Opening Stripe payment link in new tab`);

  try {
    // Open Stripe in new tab instead of redirecting
    window.open(STRIPE_PAYMENT_LINK, '_blank');
    return { success: true };
  } catch (error) {
    console.error('Payment Error:', error);
    return { success: false, error: 'Failed to open payment window.' };
  }
};

export const getFormattedPrice = () => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: APP_CONFIG.pricing.currency
  }).format(APP_CONFIG.pricing.annualPrice);
};
