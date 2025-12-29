export const APP_CONFIG = {
  branding: {
<<<<<<< HEAD
    name: "Numera", // Rebranded from FlowState to avoid trademark conflict (Class 009/036)
=======
    name: "Numera",
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
    packageId: "com.numera.finance",
    description: "Precision financial clarity tool.",
    currencySymbol: "$",
  },
  pricing: {
    annualPrice: 10.00,
    currency: 'USD',
    productName: "Numera Pro Annual"
  },
<<<<<<< HEAD
=======
  products: {
    starter: { id: 'starter', name: 'Starter', price: 4.99, duration: '3 months' },
    pro: { id: 'pro', name: 'Pro', price: 9.99, duration: '1 year' },
    business: { id: 'business', name: 'Business', price: 24.99, duration: 'Lifetime' },
    annual: { id: 'annual', name: 'Annual Pro', price: 10.00, interval: 'year' }
  },
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder',
  },
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
  legal: {
    disclaimer: "For informational purposes only. Not financial advice.",
    termsUrl: "/terms",
    privacyUrl: "/privacy"
  }
};