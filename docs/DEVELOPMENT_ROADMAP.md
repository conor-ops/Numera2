# Numera2 Accelerated Development Roadmap

**Timeline**: Aggressive week-long sprints (parallel workstreams)  
**Monetization**: Annual subscription + one-time purchases  
**Target**: Store launches by Week 6

---

## 🚀 Sprint 1: Web Payments (Days 1-7) ✅ IN PROGRESS

### Stripe Integration (Core)
- [x] Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
- [x] Create `StripePaymentModal.tsx` component with product selector UI
- [x] Update `paymentService.ts`: platform-aware payment handler
  - Web: Use Stripe Checkout
  - Native: Fall back to RevenueCat (iOS/Android)
- [x] Setup Firebase functions: `createStripeCheckoutSession` + `verifyStripeSession`
- [ ] Test integration with Stripe test keys

### One-Time Purchase Products (Config)
- [x] Define in `config.ts`:
  - **Starter** ($4.99): 3 months Pro access
  - **Pro** ($9.99): 1 year Pro access
  - **Business** ($24.99): Lifetime + email support
- [ ] Create products in Stripe Dashboard
- [ ] Configure product IDs in Firebase functions

### Testing Checklist
- [ ] Stripe test card: `4242 4242 4242 4242`
- [ ] Manual workflow: web → payment modal → Stripe → success redirect
- [ ] Verify localStorage `numera_pro_status` set after payment
- [ ] Test cancel flow & error handling

**Status**: Component & service layer ready. Pending Firebase deployment & Stripe config.

---

## 🎯 Sprint 2: Payment Consolidation & Analytics (Days 8-14)

### RevenueCat Alignment (iOS/Android)
- [ ] Map Stripe products ↔ RevenueCat offerings in dashboard
- [ ] Consolidate `isPro` sync: localStorage + RevenueCat subscription status
- [ ] Test cross-platform payment status (web Stripe → native RevenueCat)

### Analytics Foundation
- [ ] Extend `HistoryRecord` in `types.ts`:
  ```typescript
  type HistoryRecord = {
    id: string;
    date: string;
    bne: number;
    assets: number;
    liabilities: number;
    // NEW:
    ar_total: number;        // Accounts Receivable sum
    ap_total: number;        // Accounts Payable sum
    cash_balance: number;    // Bank - Credit
    runway_days?: number;    // Cash / daily burn estimate
  };
  ```
- [ ] Add `calculateMetrics()` helper function for cash flow analysis
- [ ] Extend history chart: BNE trend, cash runway, AR/AP breakdown
- [ ] Pro paywall: 24-month history + forecasting

### AI Insights Enhancement
- [ ] Update Gemini prompt to include: cash runway, expense trends, AR recommendations
- [ ] Add "Forecast" button: predict next 90 days of cash position
- [ ] Lock advanced insights behind Pro tier

**Deliverable**: Unified payment system + analytics dashboard MVP

---

## 📱 Sprint 3: Mobile Store Submission (Days 15-21)

### Pre-Store Setup
- [ ] Generate assets: `npx capacitor-assets generate`
  - Logo: `assets/logo.png` (1024x1024)
  - Splash: `assets/splash.png` (2732x2732)
- [ ] Update `capacitor.config.ts` with bundle IDs:
  - iOS: `com.numeraapp.ios`
  - Android: `com.numeraapp.android`
- [ ] Create store listing copy (screenshots, tagline)

### iOS Submission (TestFlight → App Store)
- [ ] `npm run build && npx cap sync && npx cap open ios`
- [ ] Xcode: Sign with development team
- [ ] Add capability: In-App Purchase + Sign in with Apple (optional)
- [ ] TestFlight: Internal testing (yourself + 1 tester)
- [ ] Fix crashes → submit to App Store Review (5-7 days)

### Android Submission (Closed Testing → Production)
- [ ] `npm run build && npx cap sync && npx cap open android`
- [ ] Android Studio: Generate signed AAB (new keystore, SAVE SAFELY)
- [ ] Google Play Console: Closed Testing upload (48hr approval)
- [ ] Create store listing + submit to Production

### Cross-Platform QA
- [ ] Test: login → purchase OTP → isPro unlocks features
- [ ] Verify RevenueCat sandbox transactions set isPro
- [ ] Test offline mode + sync on reconnect

**Deliverable**: Both stores live (TestFlight + Google Play)

---

## 💰 Sprint 4: Revenue Optimization (Days 22-28)

### Paywall Improvements
- [ ] A/B test pricing: $4.99 vs $7.99 Starter
- [ ] Implement 7-day free Pro trial (RevenueCat backend)
- [ ] "Upgrade upsell" modal after 5+ transactions
- [ ] Referral system: "Share → both get $5 credit"

### Retention Hooks
- [ ] Email on churn: "We miss you — 50% off to return"
- [ ] Push notifications: "Your runway is 30 days. Review forecasts."
- [ ] Weekly digest: "Your BNE improved by 15%!"

### Analytics Tracking
- [ ] PostHog events:
  - `user_purchased_otp` (product, price)
  - `user_viewed_paywall` (dismissed/converted)
  - `user_calculated_bne` (formula used)
- [ ] Dashboard metrics: LTV, conversion, churn

**Deliverable**: Revenue monitoring + retention framework

---

## 📊 Sprint 5: Analytics Phase 2 (Days 29-35)

### Cash Flow Forecasting
- [ ] `forecastCashFlow(months: 3)` using linear regression
- [ ] Predict: "If AR collects avg, you have 47 days runway"
- [ ] Interactive slider: adjust collection rate assumptions
- [ ] Pro-only feature

### Expense Categorization
- [ ] Add `category?: 'SALARY' | 'RENT' | 'MARKETING' | 'TOOLS' | 'OTHER'`
- [ ] UI dropdown in transaction input
- [ ] Pie chart: spend by category
- [ ] Insight: "Salary is 65% (industry avg 50%)"

### Export Features (Pro)
- [ ] "Export to CSV": all transactions
- [ ] "Export to PDF": formatted report + charts
- [ ] Use `jspdf` + `pdfkit` library

**Deliverable**: Full analytics suite unlocked for Pro users

---

## 🔐 Ongoing (Parallel)

### Security & Compliance
- **Week 1**: Move Gemini API key → Cloud Function (no client exposure)
- **Week 2**: Add request rate limiting to Firebase functions
- **Week 3**: Encrypt RevenueCat tokens at rest
- **Week 4+**: App Store privacy compliance review

### Infrastructure
- **Week 2**: Setup Sentry error tracking
- **Week 3**: Configure PostHog analytics
- **Week 4**: Database backup automation

---

## 💻 Immediate Next Steps (Today)

```bash
# 1. Create Stripe account (or use existing test keys)
# 2. Add to .env.local:
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
VITE_GEMINI_API_KEY=your_key

# 3. Deploy Firebase functions with secrets:
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET

# 4. Test build
npm run build

# 5. Start dev server
npm run dev
# Visit http://localhost:3000 → click "Upgrade" → test modal
```

---

## 📌 Success Metrics (28 Days)

| Milestone | Week | Target |
|-----------|------|--------|
| Stripe web payments live | 1 | 5+ test purchases |
| OTP products in Stripe + RevenueCat | 1 | Products created in both |
| Analytics MVP (cash runway) | 2 | Pro users see 90-day forecast |
| iOS TestFlight beta | 3 | 2 testers, 0 crashes |
| Android Google Play (closed) | 3 | Closed testing group active |
| Both stores public | 4 | Downloadable by public |
| Revenue tracked in dashboard | 4 | LTV/conversion metrics live |

---

## 🎬 Current Status

**✅ Completed**: 
- Stripe dependencies installed
- StripePaymentModal component built
- paymentService.ts updated with Stripe + RevenueCat logic
- config.ts products configured
- Firebase functions skeleton (Stripe checkout + verify)
- Roadmap documentation

**🔄 In Progress**:
- Firebase function deployment
- Stripe test account setup
- Environment configuration

**📋 Blocked On**:
- Stripe secret key (need to add to Firebase)
- Test payment terminal

Let's ship this in 4 weeks. 🚀
