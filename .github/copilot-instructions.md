# Numera - AI Coding Agent Instructions

**Numera** is a financial clarity tool for small business owners, providing real-time cash flow analysis via a mobile-first React + Capacitor app with AI-powered insights. The core offering is **Business Net Exact (BNE)**—a solvency metric combining accounts receivable, payable, bank, and credit positions.

## Project Architecture

### CRITICAL: Environment Separation
**Numera2 has TWO completely separate environments that must NEVER be mixed:**

#### **Frontend & Mobile** (Root `/`)
- **Stack**: React 19, TypeScript 5.8, Vite 6.2, Tailwind CSS, Lucide React
- **Config**: `package.json` (root)
- **Data**: `@capacitor-community/sqlite` v6.0.0 (mobile) / localStorage (web)
- **Build**: `npm run build` → `dist/`
- **Math**: MANDATORY use Decimal.js for all financial calculations
- **Constraint**: ⛔ NEVER import backend libraries (`firebase-functions`, `firebase-admin`)

#### **Backend Proxy** (`/functions`)
- **Stack**: Node.js 18, Firebase Cloud Functions v2, TypeScript
- **Config**: `functions/package.json` (separate from root)
- **Role**: Securely holds API keys (Gemini) and proxies AI requests
- **Deploy**: `firebase deploy --only functions`
- **Constraint**: ⛔ NEVER import React or UI libraries

### Core Tech Stack
- **Frontend**: React 19, TypeScript 5.8, Vite 6.2, Tailwind CSS, Lucide React icons
- **Mobile**: Capacitor 6 (iOS/Android) with SQLite persistence via `@capacitor-community/sqlite` v6.0.0
- **AI**: Google Gemini 2.5 via Firebase Cloud Functions (client proxies through `/functions`)
- **Payments**: RevenueCat Purchases v8.0.0+ (mobile only; web uses mock)
- **Precision Math**: Decimal.js (mandatory for all financial calculations to prevent floating-point errors)

### Data Flow & Business Logic
1. **Input Layer** (`components/`): User enters transactions (AR/AP) and bank accounts
2. **Calculation Core** (`App.tsx`): Computes BNE metric locally on device
   - **BNE = (Total AR + Total Bank) - (Total AP + Total Credit)**
   - Uses Decimal.js throughout for precision
3. **AI Layer** (`services/geminiService.ts` → `functions/src/index.ts`): 
   - Client calls Cloud Function URL with calculation data
   - Server (`/functions`) calls Gemini API using API key from Google Secret Manager
   - Client never holds the API key—security via backend proxy
4. **Persistence** (`services/databaseService.ts`): 
   - Mobile: SQLite v6.0.0 for durability
   - Web: localStorage for demo/testing
   - Auto-detects platform and switches seamlessly

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

### Dependency Management - CRITICAL
**Root and `/functions` have SEPARATE `node_modules`. Never mix them.**

#### Frontend (Root)
```bash
npm install  # Installs root dependencies
```

#### Backend (Functions)
```bash
cd functions
npm install  # Installs function-specific dependencies ONLY
cd ..
```

**Common Error**: "Module not found" → You installed a backend library in root instead of `/functions`. Run `cd functions && npm install`.

### Build & Run Frontend
```bash
npm install
npm run dev       # Vite dev server on localhost:3000
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

### Mobile Sync Workflow (Capacitor)
**Native projects (ios/android) depend on built web assets. Order matters:**
```bash
npm run build                # 1. Build React app to dist/
npx cap sync                 # 2. Sync dist/ and plugins to ios/android folders
npx cap open ios             # 3. Open Xcode to build iOS app
npx cap open android         # 4. Open Android Studio to build APK
```

**Critical**: Never run `npx cap sync` without `npm run build` first—native code won't reflect your changes.

### Backend Deployment
```bash
firebase deploy --only functions  # Deploy Cloud Functions (run from root or functions/ folder)
```

**Note**: The lint script in `functions/package.json` is set to "exit 0" to prevent style issues from blocking deployment.

### Environment Setup
- **Frontend**: Create `.env.local` with `GEMINI_API_KEY=your_key` (for local dev only; not committed)
  - `vite.config.ts` exposes via `process.env.GEMINI_API_KEY`
- **Backend**: Gemini API key stored in Google Secret Manager (accessed by Cloud Functions, not in code)
- **RevenueCat**: API key configured in `config.ts` for mobile (not for web)

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
