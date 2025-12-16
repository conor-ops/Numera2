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
npm install
npm run dev      # Vite dev server on localhost:3000
npm run build    # Production build
npm run preview  # Preview production build
```

### Environment Setup
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

## Technical Reference

### Gemini Cloud Function (backend contract)
- HTTPS callable; payload `{ calculations: CalculationResult, bankBreakdown: string }` (matches `generateFinancialInsight` request).
- Response shape `{ insight: string }`; treat non-200 as error.
- Reads `GEMINI_API_KEY` from server-side secret; front-end only sends data payload.
- Until `FUNCTION_URL` is set, `geminiService` returns demo text after ~1.5s.

### Mobile / Capacitor setup
- Build web assets first (`npm run build`), then `npx cap sync` to push into `ios/` and `android/`.
- Plugin versions tested with Capacitor 6: `@capacitor-community/sqlite@6.0.0`, `@revenuecat/purchases-capacitor@8.x`.
- SQLite is native-only; web falls back to `localStorage` mock automatically.

### Testing guidance
- Financial math: always use `Decimal` in tests; assert e.g. `new Decimal(0.1).plus(0.2).equals(0.3)` to avoid float drift.
- DB: mock `Capacitor.getPlatform()` to `web` to exercise localStorage path without native SQLite.
- Payments: mock RevenueCat client; validate entitlement gating without hitting network.

### Payment flow (RevenueCat)
- Flow: `Purchases.getOfferings()` → pick package → `Purchases.purchasePackage()` → fetch `customerInfo` → gate on `customerInfo.entitlements.active['pro_access']`.
- `initiateCheckout()` enforces paid access before premium actions; keep entitlement key stable (`pro_access`).

## Debugging Tips
- Check browser console for DB initialization warnings on web platform
- Use `Decimal.js` methods (`toFixed()`, `toNumber()`) for precision verification
- Haptic calls are silent on web (Capacitor handles gracefully)
- Mock database in localStorage for web testing: `localStorage.getItem('numera_mock_db')`
