import { APP_CONFIG } from '../config';

// Interface for payment intent results
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Abstraction for initiating a checkout process.
 * currently logs to console, but designed to hook into Stripe/PayPal SDKs.
 */
export const initiateCheckout = async (amount: number, currency: string = 'USD'): Promise<PaymentResult> => {
  console.log(`[PaymentService] Initiating checkout for ${currency} ${amount.toFixed(2)}`);
  
  // TODO: Replace with actual Stripe/PayPal implementation
  // This structure allows switching providers without refactoring the UI
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate success for dev environment
      console.log(`[PaymentService] Transaction Mock Success`);
      resolve({ success: true, transactionId: `mock_${Date.now()}` });
    }, 1000);
  });
};

export const getFormattedPrice = () => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: APP_CONFIG.pricing.currency
  }).format(APP_CONFIG.pricing.annualPrice);
};