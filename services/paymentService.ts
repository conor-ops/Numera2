import { APP_CONFIG } from '../config';
import { Capacitor } from '@capacitor/core';
import Stripe from '@stripe/stripe-js';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  duration?: string;
  interval?: string;
}

let stripePromise: ReturnType<typeof Stripe.loadStripe> | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    stripePromise = Stripe.loadStripe(APP_CONFIG.stripe.publicKey);
  }
  return stripePromise;
};

/**
 * Initiates checkout via Stripe Payment Element.
 * On web: Uses Stripe embedded form
 * On native: Falls back to RevenueCat (handled in App.tsx)
 */
export const initiateCheckout = async (product: Product, onSuccess?: (transactionId: string) => void): Promise<PaymentResult> => {
  const platform = Capacitor.getPlatform();
  
  // Native platforms use RevenueCat (see App.tsx PaywallModal)
  if (platform !== 'web') {
    console.log('[PaymentService] Native platform detected, use RevenueCat instead');
    return { success: false, error: 'Use RevenueCat for native payments' };
  }

  console.log(`[PaymentService] Initiating Stripe checkout for ${product.name} ($${product.price})`);

  try {
    // Create checkout session via Firebase function
    const response = await fetch('/api/createStripeCheckoutSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        amount: Math.round(product.price * 100), // Convert to cents
        currency: 'usd',
        successUrl: `${window.location.origin}?payment=success&sessionId={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}?payment=cancelled`,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to create checkout session`);
    }

    const data = await response.json();
    const { sessionId, url } = data;

    // Redirect to Stripe Checkout hosted page
    if (url) {
      window.location.href = url;
      return { success: true, transactionId: sessionId };
    } else {
      throw new Error('No checkout URL provided');
    }

  } catch (error) {
    console.error('Payment Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Payment processing failed' };
  }
};

/**
 * Verify payment session after redirect from Stripe.
 * Called on app mount to check for successful payments.
 */
export const verifyPaymentSession = async (sessionId: string): Promise<PaymentResult> => {
  try {
    const response = await fetch('/api/verifyStripeSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();

    if (data.status === 'complete' && data.paid) {
      // Store payment confirmation
      localStorage.setItem('numera_payment_confirmed', JSON.stringify({
        sessionId,
        timestamp: new Date().toISOString(),
        productId: data.metadata?.productId,
      }));

      return { success: true, transactionId: sessionId };
    }

    return { success: false, error: 'Payment not completed' };
  } catch (error) {
    console.error('Session verification error:', error);
    return { success: false, error: 'Could not verify payment' };
  }
};

export const getFormattedPrice = (price: number = APP_CONFIG.pricing.annualPrice) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: APP_CONFIG.pricing.currency
  }).format(price);
};

export const getProducts = (): Product[] => {
  return [
    APP_CONFIG.products.starter,
    APP_CONFIG.products.pro,
    APP_CONFIG.products.business,
  ];
};
