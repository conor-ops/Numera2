# Numera - AI Coding Agent Instructions

**Numera** is a financial clarity tool for small business owners, providing real-time cash flow analysis via a mobile-first React + Capacitor app with AI-powered insights.

## Project Architecture

### Core Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Mobile**: Capacitor 6 (iOS/Android) with SQLite persistence
- **AI**: Google Gemini 2.5 via Firebase Cloud Functions (pending deployment)
- **Payments**: RevenueCat Purchases (subscription management)
- **Precision Math**: Decimal.js (prevents floating-point errors in financial calculations)

### Data Flow & Business Logic
1. **Input Layer** (`components/`): User enters transactions and bank accounts
2. **Calculation Core** (`App.tsx`): Computes Business Net Exact (BNE) — the key metric
   - BNE = (Total AR + Total Bank) - (Total AP + Total Credit)
   - Uses Decimal.js throughout to avoid financial rounding errors
3. **AI Layer** (`services/geminiService.ts`): Calls cloud function for personalized insights
4. **Persistence** (`services/databaseService.ts`): Saves snapshots & history to SQLite (mobile) or localStorage (web)

**Key Types** (`types.ts`):
- `Transaction`: Accounts Receivable (INCOME) or Accounts Payable (EXPENSE)
- `BankAccount`: Checking, Savings, or Credit accounts
- `CalculationResult`: Contains BNE, asset/liability totals, and bank breakdown

## Critical Patterns & Conventions

### Decimal Arithmetic
**All financial amounts use `Decimal.js`, never raw numbers:**
```typescript
const total = items.reduce((acc, item) => acc.plus(new Decimal(item.amount || 0)), new Decimal(0)).toNumber();
```
When storing in DB, convert to cents (integers) to avoid precision issues:
```typescript
const cents = Math.round(amount * 100);
```

### State Management
- `App.tsx` is the single source of truth — all data flows through `useState` here
- Components call `onUpdate` callbacks with entire updated arrays (immutable pattern)
- No external state library; simplicity prioritized for mobile performance

### Haptic Feedback
Integrated via Capacitor Haptics. Use `ImpactStyle.Light` for value changes, `Medium` for structural changes:
```typescript
import { ImpactStyle } from '@capacitor/haptics';
triggerHaptic(ImpactStyle.Light);
```

### Multi-Platform Handling
`databaseService.ts` detects platform and falls back gracefully:
```typescript
if (Capacitor.getPlatform() === 'web') {
  localStorage.setItem('numera_mock_db', JSON.stringify(data));
}
```

## Development Workflow

### Build & Run
```bash
npm instal - JavaScript floating point errors: 0.1 + 0.2 ≠ 0.3
const total = items.reduce((acc, item) => acc + item.amount, 0);
```

When persisting to database, convert to cents (integers):
```typescript
const cents = Math.round(amount * 100); // $123.45 → 12345
```

**Why**: Floating-point precision errors are unacceptable in financial apps. Always use Decimal.js for any math involving money.

### AI Integration - Backend Proxy Pattern
**Client** (`services/geminiService.ts`):
- Calls Cloud Function URL with calculation data
- Never holds Gemini API key
- Receives insights from backend

**Backend** (`functions/src/index.ts`):
- Uses `@google/generative-ai` package
- Retrieves API key from Google Secret Manager (secure, not in code)
- Calls Gemini 2.5 API and returns insights to client

**Pattern**: Client proxies through backend to keep API keys secure. Never expose API keys to the frontend.

### Payments (RevenueCat) - Mobile Only
- **Mobile**: Full RevenueCat integration via Capacitor
- **Web**: Mock/fallback implementation in `paymentService.ts`

Check subscription:
```typescript
const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
const hasProAccess = customerInfo.entitlements.active['pro_access'] !== null;
```

Purchase:
```typescript
const offerings = await Purchases.getSharedInstance().getOfferings();
const package = offerings.current?.getPackage('numera_pro_annual');
await Purchases.getSharedInstance().purchasePackage(package);
```

Data Persistence - Hybrid Platform Support
**Frontend** (`services/databaseService.ts`) auto-switches:
- **Mobile**: SQLite for durability
- **Web**: localStorage for demo/testing

Abstraction handles platform detection:
```typescript
if (Capacitor.getPlatform() === 'web') {
  localStorage.setItem('numera_mock_db', JSON.stringify(data));
} else {
  // Use SQLite on native platforms
}
- Set `GEMINI_API_KEY` in `.env.local` (not committed)
- `vite.config.ts` exposes this as `process.env.GEMINI_API_KEY`

### Deployment Blocking Issue
`geminiService.ts` has placeholder `FUNCTION_URL = 'YOUR_CLOUD_FUNCTION_URL_HERE'`. Until Firebase Functions are deployed, app returns demo mode insights. Replace with actual endpoint once deployed.

## Common Tasks & Code Locations

| Task | Files | Notes |
|------|-------|-------|
| Add financial input field | `components/FinancialInput.tsx` | Reusable component; update prop interfaces in `types.ts` |
| Modify calculation formula | `App.tsx` lines ~200-250 | Update `CalculationResult` type first |
| New database table | `services/databaseService.ts` setupDatabase() | Update TypeScript types simultaneously |
| Add Capacitor plugin | `package.json` + `capacitor.config.ts` | Run `npx cap sync` after install |
| UI styling | Tailwind + inline shadows (`shadow-swiss`) | Custom border styling in `App.tsx` and components |

## Integration Points

- **RevenueCat**: `paymentService.ts` handles subscriptions (initialized but API key needed)
- **Gemini AI**: Demo fallback in `geminiService.ts` is intentional for development
- **SQLite**: Only active on native platforms; web uses localStorage mock
- **Payment Check**: `initiateCheckout()` enforces paid subscription for full access

## Debugging Tips
- Check browser console for DB initialization warnings on web platform
- Use `Decimal.js` methods (`toFixed()`, `toNumber()`) for precision verification
- Haptic calls are silent on web (Capacitor handles gracefully)
- Mock database in localStorage for web testing: `localStorage.getItem('numera_mock_db')`

## Technical Reference

### Firebase Cloud Functions Signature
The Gemini insight endpoint expects:
```
POST https://YOUR_CLOUD_FUNCTION_URL_HERE

Request:
{
  "calculations": {
    "totalAR": number,
    "totalAP": number,
    "totalCredit": number,
    "totalBank": number,
    "bankBreakdown": Record<string, number>,
    "netReceivables": number,
    "netBank": number,
    "bne": number,
    "bneFormulaStr": string
  },
  "bankBreakdown": string
}

Response:
{
  "insight": string  // AI-generated financial recommendation
}
```
Auth: Function should validate `GEMINI_API_KEY` from Cloud Run Secrets. Current `geminiService.ts` sends raw data; function must call Gemini 2.5 API with business context.

### Mobile Setup (Capacitor 6)
Critical version constraints:
- `@capacitor-community/sqlite`: v6.0.0 (must match Capacitor 6)
- `@revenuecat/purchases-capacitor`: v8.0.0+ (requires Capacitor 6+)

After modifying `package.json`:
```bash
npm install
npx cap sync        # Syncs dist/ and plugins to ios/android folders
npx cap open ios    # Open Xcode to build iOS app
npx cap open android # Open Android Studio to build APK
```
Do NOT run `npm run build` without syncing; changes won't reach native code.

### Testing Approach
**Math Testing**: Always verify Decimal.js prevents rounding errors:
```typescript
// WRONG: 0.1 + 0.2 === 0.3 (false in JavaScript!)
// RIGHT:
new Decimal(0.1).plus(new Decimal(0.2)).equals(new Decimal(0.3)) // true
```

**Payment Testing**: Use RevenueCat's Sandbox environment:
1. Create test users in RevenueCat Dashboard
2. Install app with sandbox credentials in `config.ts`
3. Test `restorePurchases()` to verify entitlement retrieval
4. Always test on native device (iOS TestFlight/Android beta) before production

**Database Testing**: On web, mock with:
```javascript
localStorage.setItem('numera_mock_db', JSON.stringify(mockData));
```

### Payment Flow (RevenueCat)
Integration located in `services/paymentService.ts`:

1. **Initialization**: Call `Purchases.configure()` with RevenueCat API key (set in `config.ts`)
2. **Check Subscription**: 
```typescript
const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
const hasProAccess = customerInfo.entitlements.active['pro_access'] !== null;
```
3. **Retrieve Offerings**:
```typescript
const offerings = await Purchases.getSharedInstance().getOfferings();
const package = offerings.current?.getPackage('numera_pro_annual');
```
4. **Purchase**:
```typescript
await Purchases.getSharedInstance().purchasePackage(package);
```
5. **Full Access Gated**: `initiateCheckout()` in `App.tsx` enforces `pro_access` entitlement for features beyond demo mode.

Entitlements configured in RevenueCat Dashboard:
- Product ID: `numera_pro_annual` (Annual subscription, $10 USD)
- Entitlement: `pro_access` (unlocks full app features)
