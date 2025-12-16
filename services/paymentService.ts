import { Purchases, PurchasesPackage, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { APP_CONFIG } from '../config';

// REVENUECAT PUBLIC API KEYS
// TODO: Replace these with your actual keys from the RevenueCat dashboard
const API_KEYS = {
  ios: 'appl_YOUR_IOS_KEY_HERE',
  android: 'goog_YOUR_ANDROID_KEY_HERE',
};

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const initializePayments = async () => {
  if (Capacitor.getPlatform() === 'web') {
    console.log('[Payment] Web platform detected. Skipping native initialization.');
    return;
  }

  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

    if (Capacitor.getPlatform() === 'ios') {
      await Purchases.configure({ apiKey: API_KEYS.ios });
    } else if (Capacitor.getPlatform() === 'android') {
      await Purchases.configure({ apiKey: API_KEYS.android });
    }
    
    console.log('[Payment] RevenueCat initialized successfully');
  } catch (error) {
    console.error('[Payment] Initialization failed', error);
  }
};

export const getFormattedPrice = async (): Promise<string> => {
  if (Capacitor.getPlatform() === 'web') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: APP_CONFIG.pricing.currency
    }).format(APP_CONFIG.pricing.annualPrice);
  }

  try {
    // Fetch offerings to get the real localized price from the App Store
    const offerings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      return offerings.current.availablePackages[0].product.priceString;
    }
  } catch (error) {
    console.error('Error fetching price:', error);
  }
  
  return '$10.00'; // Fallback
};

export const initiateCheckout = async (): Promise<PaymentResult> => {
  if (Capacitor.getPlatform() === 'web') {
    // Web Fallback (Stripe Link or similar would go here for web)
    // For now, we simulate success in dev, but warn in prod
    console.warn('[Payment] Web payments require a Stripe/PayPal integration.');
    return { success: true, transactionId: `web_mock_${Date.now()}` };
  }

  try {
    const offerings = await Purchases.getOfferings();
    
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      const packageToBuy = offerings.current.availablePackages[0];
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToBuy });
      
      if (customerInfo.entitlements.active['pro_access']) {
         // 'pro_access' must match your Entitlement ID in RevenueCat
         return { success: true, transactionId: customerInfo.originalAppUserId };
      }
    } else {
      return { success: false, error: 'No offerings configured in RevenueCat' };
    }
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, error: 'User cancelled' };
    }
    return { success: false, error: error.message };
  }
  
  return { success: false, error: 'Unknown payment error' };
};

export const checkSubscriptionStatus = async (): Promise<boolean> => {
   if (Capacitor.getPlatform() === 'web') return false;

   try {
     const { customerInfo } = await Purchases.getCustomerInfo();
     return typeof customerInfo.entitlements.active['pro_access'] !== "undefined";
   } catch (error) {
     console.error("Error checking subscription:", error);
     return false;
   }
};