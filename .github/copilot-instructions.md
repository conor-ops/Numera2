# Numera2 - AI Copilot Instructions

**Numera2** is a cross-platform financial clarity tool (Assets - Liabilities = BNE). It's a hybrid app using React (Frontend) and Firebase Cloud Functions (Backend), wrapped in Capacitor for mobile.

## 1. Architecture & Boundaries (CRITICAL)

The project has TWO distinct environments that **must never be mixed**:

### Frontend & Mobile (Root `/`)
- **Stack**: React 19, TypeScript 5.8, Vite 6.2, Tailwind CSS, Capacitor 6
- **Config**: `package.json` (root)
- **Data**: `@capacitor-community/sqlite` v6.0.0 (mobile) / localStorage (web)
- **Math**: **ALWAYS use `Decimal.js`** for financial calculations. Never use native JavaScript floats.
- **Constraint**: ⛔ **NEVER import backend libraries** (`firebase-functions`, `firebase-admin`)

### Backend (Cloud Proxy) (`/functions`)
- **Stack**: Node.js 18, Firebase Cloud Functions v2, TypeScript
- **Config**: `functions/package.json` (separate from root)
- **Role**: Securely holds API keys (Gemini) and proxies requests from frontend
- **Deploy**: `firebase deploy --only functions`
- **Constraint**: ⛔ **NEVER import React or UI libraries**

## 2. Developer Workflows

### Dependency Management - CRITICAL
**Root and `/functions` have SEPARATE `node_modules`. Never mix them.**

#### Frontend (Root)
```bash
npm install  # Installs root dependencies only
```

#### Backend (Functions)
```bash
cd functions
npm install  # Installs function-specific dependencies ONLY
cd ..
```

**Common Error**: "Module not found" in Cloud Functions → You installed a backend library in root instead of `/functions/node_modules`. Fix: `cd functions && npm install`

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
npx cap sync                 # 2. Sync dist/ and plugins to ios/android
npx cap open ios             # 3. Open Xcode to build iOS
npx cap open android         # 4. Open Android Studio to build APK
```

**Critical**: Never run `npx cap sync` without `npm run build` first—native code won't be updated.

### Backend Deployment
```bash
firebase deploy --only functions  # Run from root or functions/ folder
```

**Note**: The lint script in `functions/package.json` is set to "exit 0" to prevent deployment blocks on style issues.

### Environment Setup
- **Frontend**: Create `.env.local` with `GEMINI_API_KEY=your_key` (for local dev only; not committed)
  - `vite.config.ts` exposes via `process.env.GEMINI_API_KEY`
- **Backend**: Gemini API key stored in Google Secret Manager (accessed by Cloud Functions, not in code)
- **RevenueCat**: API key configured in `config.ts` for mobile only

## 3. Key Patterns & Conventions

### Financial Precision (MANDATORY)
**All financial amounts must use `Decimal.js`, never raw numbers:**

```typescript
// ✓ CORRECT
const total = items.reduce(
  (acc, item) => acc.plus(new Decimal(item.amount || 0)), 
  new Decimal(0)
).toNumber();

// ✗ WRONG - Floating point errors: 0.1 + 0.2 ≠ 0.3 in JavaScript!
const total = items.reduce((acc, item) => acc + item.amount, 0);
```

When persisting to database, convert to cents (integers):
```typescript
const cents = Math.round(amount * 100); // $123.45 → 12345 cents
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

**Pattern**: Client proxies through backend to keep API keys secure. Never expose API keys to frontend.

### Payments (RevenueCat)
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

### Data Persistence (Hybrid)
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
```

## 4. Troubleshooting Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Module not found" in Functions | Installed library in root `node_modules` instead of `functions/node_modules` | `cd functions && npm install` |
| "Web assets directory not found" (Capacitor error) | Forgot to build before syncing | Run `npm run build` before `npx cap sync` |
| Peer dependency conflict with @capacitor or RevenueCat | Version mismatch | Ensure `@capacitor/core` is v6 and `@revenuecat/purchases-capacitor` is v8+ |
| Styling not appearing after Capacitor sync | Dist files stale | Run `npm run build && npx cap sync` |
| AI insights not working | Cloud Function URL not deployed | Replace `FUNCTION_URL` placeholder in `services/geminiService.ts` after Firebase deployment |
| Changes not syncing to native code | Skipped build step before sync | Always: `npm run build` → `npx cap sync` → open Xcode/Android Studio |

## 5. Common Tasks & Code Locations

| Task | Files | Key Notes |
|------|-------|-----------|
| Add new financial field | `types.ts` (interface), `components/FinancialInput.tsx`, `App.tsx` | Update types first, then components |
| Modify BNE formula | `App.tsx` lines ~200-250 | Update `CalculationResult` type simultaneously |
| Add database table | `services/databaseService.ts` (`setupDatabase()` schema) | Sync TypeScript types in `types.ts` |
| New Capacitor plugin | `package.json` + `capacitor.config.ts` | Run `npm run build && npx cap sync` after install |
| UI styling changes | Tailwind in components, `App.tsx` global styles | Reference `shadow-swiss` custom class |
| AI insights logic | `functions/src/index.ts` (backend) | Requires Gemini API key in Secret Manager |
| Payment flow | `services/paymentService.ts`, check `config.ts` for pricing | RevenueCat API key required for mobile |

## 6. Project Structure

```
Numera2/
├── App.tsx                      # Main app, BNE calculations
├── types.ts                     # Shared TypeScript interfaces
├── components/                  # React components (FinancialInput, BankInput, BudgetPlanner)
├── services/
│   ├── geminiService.ts        # Frontend AI proxy (calls /functions)
│   ├── databaseService.ts      # SQLite/localStorage abstraction
│   ├── paymentService.ts       # RevenueCat integration
│   └── hapticService.ts        # Capacitor haptics
├── package.json                # Frontend dependencies
├── vite.config.ts              # Vite build config
├── capacitor.config.ts         # Mobile platform config
├── functions/
│   ├── src/
│   │   └── index.ts           # Cloud Function (Gemini proxy)
│   ├── package.json           # Backend dependencies (separate!)
│   └── tsconfig.json
└── .github/
    └── copilot-instructions.md  # This file
```

## 7. Debugging Tips

- **Web Platform Issues**: Check browser console for SQLite/Capacitor warnings. Database falls back to localStorage automatically.
- **Precision Issues**: Use `new Decimal(value).toFixed(2)` to verify calculations—never trust raw JavaScript floats.
- **Haptic Feedback**: Silently ignored on web (Capacitor handles gracefully). Test on native device for real feedback.
- **Database Inspection (Web)**: `console.log(JSON.parse(localStorage.getItem('numera_mock_db')))` to inspect mock database.
- **Mobile Sync**: After changing `package.json`, run `npm run build && npx cap sync` before opening Xcode/Android Studio.
- **Backend Errors**: Check Cloud Functions logs in Firebase Console. Lint script set to "exit 0" won't block deployment.
- **API Key Issues**: Ensure `GEMINI_API_KEY` is set in `.env.local` for local testing. Backend uses Google Secret Manager in production.

## 8. Environment Constraints

### Frontend-Only Rules
- No imports from `firebase-functions` or `firebase-admin`
- No backend secrets in code
- All financial math uses `Decimal.js`
- UI libraries only (React, Tailwind, Lucide, Capacitor)

### Backend-Only Rules
- No imports from React, Vite, Tailwind
- Handle all API key management via Google Secret Manager
- Return JSON responses for frontend consumption
- Validate all inputs (calculations are sent from untrusted frontend)

### Capacitor Rules
- Build → Sync → Open (always in this order)
- Web assets in `dist/` are synced to native projects
- SQLite only on native; localStorage is fallback
- RevenueCat mobile only; web has mock implementation
