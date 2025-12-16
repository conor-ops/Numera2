# Numera - AI Coding Agent Instructions

**Numera** is a financial clarity tool for small business owners, providing real-time cash flow analysis via a mobile-first React + Capacitor app with AI-powered insights. The core offering is **Business Net Exact (BNE)**—a solvency metric combining accounts receivable, payable, bank, and credit positions.

## Project Architecture

### Core Tech Stack
- **Frontend**: React 19, TypeScript 5.8, Vite 6.2, Tailwind CSS, Lucide React icons
- **Mobile**: Capacitor 6 (iOS/Android) with SQLite persistence via `@capacitor-community/sqlite` v6.0.0
- **AI**: Google Gemini 2.5 via Firebase Cloud Functions (demo mode active—deployment pending)
- **Payments**: RevenueCat Purchases v8.0.0+ (subscription management, includes sandbox testing)
- **Precision Math**: Decimal.js (mandatory for all financial calculations to prevent floating-point errors)

### Data Flow & Business Logic
1. **Input Layer** (`components/`): User enters transactions (AR/AP) and bank accounts
2. **Calculation Core** (`App.tsx`): Computes BNE metric
   - **BNE = (Total AR + Total Bank) - (Total AP + Total Credit)**
   - Uses Decimal.js throughout for precision
3. **AI Layer** (`services/geminiService.ts`): Calls Firebase Cloud Function for insights (demo fallback active)
4. **Persistence** (`services/databaseService.ts`): Saves snapshots & history to SQLite (native) or localStorage (web)

### Key Data Types (`types.ts`)
- `Transaction`: Represents AR (INCOME) or AP (EXPENSE) items with date
- `BankAccount`: Checking, Savings, or Credit accounts tied to institutions
- `CalculationResult`: Contains BNE, asset/liability totals, bank breakdown
- `HistoryRecord`: Time-series snapshots for trend analysis

## Critical Patterns & Conventions

### Decimal Arithmetic - MANDATORY
**All financial amounts must use `Decimal.js`, never raw numbers:**
```typescript
// ✓ CORRECT
const total = items.reduce(
  (acc, item) => acc.plus(new Decimal(item.amount || 0)), 
  new Decimal(0)
).toNumber();

// ✗ WRONG
const total = items.reduce((acc, item) => acc + item.amount, 0);
```

When persisting to database, convert to cents (integers):
```typescript
const cents = Math.round(amount * 100); // $123.45 → 12345
```

### State Management
- `App.tsx` is the single source of truth—all UI data flows through `useState` hooks
- Components use immutable pattern: `onUpdate` callbacks receive entire replaced arrays
- No Redux/Zustand—simplicity prioritized for mobile performance
- Components never mutate arrays directly; always return new array references

### Haptic Feedback Integration
Use Capacitor Haptics for feedback (silent on web, works on native):
```typescript
import { ImpactStyle } from '@capacitor/haptics';
triggerHaptic(ImpactStyle.Light);  // Value changes
triggerHaptic(ImpactStyle.Medium); // Structural changes (add/delete)
```

### Multi-Platform Handling
`databaseService.ts` detects platform and falls back gracefully:
```typescript
if (Capacitor.getPlatform() === 'web') {
  localStorage.setItem('numera_mock_db', JSON.stringify(data));
} else {
  // Use SQLite on native platforms
}
```

### UI Styling Conventions
- Tailwind CSS with custom `shadow-swiss` class for Swiss-style borders
- Border styling: `border-2 border-black` (consistent with brand design)
- Components: white background, black borders, minimal shadows
- Icons: Lucide React (24px default)

## Development Workflow

### Build & Run
```bash
npm install
npm run dev       # Vite dev server on localhost:3000
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

### Environment Setup
- Create `.env.local` with `GEMINI_API_KEY=your_key` (not committed to git)
- `vite.config.ts` exposes via `process.env.GEMINI_API_KEY`
- For RevenueCat: API key configured in `config.ts` (set before build)

### Critical Deployment Blocker
`services/geminiService.ts` contains placeholder `FUNCTION_URL = 'YOUR_CLOUD_FUNCTION_URL_HERE'`. 
**Until Firebase Functions are deployed**, the app returns demo-mode insights. Replace with actual Cloud Run endpoint once deployed.

## Common Tasks & Code Locations

| Task | Files | Key Notes |
|------|-------|-----------|
| Add new financial field | `types.ts` (interface), `components/FinancialInput.tsx`, `App.tsx` | Update types first, then components |
| Modify BNE formula | `App.tsx` lines ~200-250 | Update `CalculationResult` type simultaneously |
| Add database table | `services/databaseService.ts` (`setupDatabase()` schema) | Sync TypeScript types in `types.ts` |
| New Capacitor plugin | `package.json` + `capacitor.config.ts` | Run `npx cap sync` after npm install |
| UI styling changes | Tailwind in components, `App.tsx` global styles | Reference `shadow-swiss` custom class |
| Payment flow | `services/paymentService.ts`, check `config.ts` for pricing | RevenueCat API key required |

## Integration Points

- **RevenueCat** (`paymentService.ts`): Handles subscriptions. Requires API key in config. Sandbox mode available for testing.
- **Gemini AI** (`geminiService.ts`): Firebase Cloud Function endpoint pending. Demo fallback active—intentional for dev.
- **SQLite** (`databaseService.ts`): Only on native platforms. Web uses localStorage mock for testing.
- **Keyboard** (`capacitor.config.ts`): Configured to resize body; dismiss on enter.
- **StatusBar** (`capacitor.config.ts`): Dark style, opaque white background.

## Debugging Tips

- **Web Platform Issues**: Check browser console for SQLite/Capacitor warnings. Database falls back to localStorage automatically.
- **Precision Issues**: Use `new Decimal(value).toFixed(2)` to verify calculations—never trust raw JavaScript floats.
- **Haptic Feedback**: Silently ignored on web (Capacitor handles gracefully). Test on native device for real feedback.
- **Database Inspection (Web)**: `console.log(JSON.parse(localStorage.getItem('numera_mock_db')))` to inspect mock database.
- **Mobile Sync**: After changing `package.json`, run `npx cap sync` before opening Xcode/Android Studio.

## Technical Reference

### Firebase Cloud Functions Contract
The Gemini insight endpoint must accept:
```
POST https://YOUR_CLOUD_FUNCTION_URL_HERE

Request Body:
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

Response Body:
{
  "insight": string  // AI-generated financial recommendation
}
```

Function should validate `GEMINI_API_KEY` from Cloud Run Secrets and call Gemini 2.5 API with business context.

### Mobile Setup (Capacitor 6)
**Critical version constraints:**
- `@capacitor-community/sqlite`: v6.0.0 (must match Capacitor 6)
- `@revenuecat/purchases-capacitor`: v8.0.0+ (requires Capacitor 6+)

**After modifying package.json:**
```bash
npm install
npx cap sync                    # Syncs dist/ and plugins to ios/android
npx cap open ios                # Opens Xcode to build iOS
npx cap open android            # Opens Android Studio to build APK
```

**Critical**: Do NOT run `npm run build` without syncing; native code won't be updated.

### Testing Approaches

**Math Testing**: Always verify Decimal.js prevents rounding errors:
```typescript
// ✗ WRONG in JavaScript
0.1 + 0.2 === 0.3  // false!

// ✓ CORRECT with Decimal.js
new Decimal(0.1).plus(new Decimal(0.2)).equals(new Decimal(0.3))  // true
```

**Payment Testing**: Use RevenueCat Sandbox:
1. Create test users in RevenueCat Dashboard
2. Configure sandbox credentials in `config.ts`
3. Test `restorePurchases()` to verify entitlement retrieval
4. Always test on native device (TestFlight/beta) before production

**Database Testing (Web)**: Mock with localStorage:
```javascript
localStorage.setItem('numera_mock_db', JSON.stringify({
  transactions: [],
  accounts: []
}));
```

### Payment Flow (RevenueCat Integration)
Located in `services/paymentService.ts`:

1. **Initialize**: Call `Purchases.configure()` with RevenueCat API key from `config.ts`
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
5. **Gate Full Access**: `initiateCheckout()` in `App.tsx` enforces `pro_access` entitlement

**RevenueCat Configuration**:
- Product ID: `numera_pro_annual` (Annual subscription, $10 USD)
- Entitlement: `pro_access` (unlocks full app features)
- Configured in RevenueCat Dashboard (not in code)
