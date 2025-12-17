export const APP_CONFIG = {
  branding: {
    name: "Numera",
    packageId: "com.numera.finance",
    description: "Precision financial clarity tool.",
    currencySymbol: "$",
  },
  pricing: {
    annualPrice: 10.00,
    currency: 'USD',
    productName: "Numera Pro Annual"
  },
  products: {
    starter: { id: 'starter', name: 'Starter', price: 4.99, duration: '3 months' },
    pro: { id: 'pro', name: 'Pro', price: 9.99, duration: '1 year' },
    business: { id: 'business', name: 'Business', price: 24.99, duration: 'Lifetime' },
    annual: { id: 'annual', name: 'Annual Pro', price: 10.00, interval: 'year' }
  },
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder',
  },
  legal: {
    disclaimer: "For informational purposes only. Not financial advice.",
    termsUrl: "/terms",
    privacyUrl: "/privacy"
  }
};