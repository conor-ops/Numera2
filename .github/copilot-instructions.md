# Numera Development Guide

## Quick Start
```bash
npm install
$env:GEMINI_API_KEY="your-key"  # PowerShell (or: export GEMINI_API_KEY="key")
npm run dev                      # Runs on http://localhost:3000
```

## Architecture Overview
Single-file React app (`App.tsx`, 669 lines) with service abstraction layer for cross-platform compatibility (web vs native iOS/Android).

**Core Stack**: React 19 + TypeScript + Vite + Capacitor 5 + RevenueCat + Tailwind + SQLite  
**Key Pattern**: Platform detection via `Capacitor.getPlatform()` — web uses localStorage, native uses SQLite  
**State**: Pure React hooks (no Redux), auto-saves on every data change via `useEffect`

## Critical Conventions

### 1. Money Math = Decimal.js (ALWAYS)
```typescript
// ✓ CORRECT
const total = items.reduce((acc, i) => acc.plus(new Decimal(i.amount || 0)), new Decimal(0));
const result = total.toNumber().toFixed(2); // Convert for display

// ✗ WRONG - Never use plain JavaScript arithmetic for money
const total = items.reduce((sum, i) => sum + i.amount, 0);
```
**Storage**: DB stores cents (`amount_cents` column) to eliminate float errors. Always multiply by 100 on save, divide by 100 on load (see `databaseService.ts` L107-L130).  
**Components**: Display uses `.toLocaleString()` for currency formatting (e.g., `BankInput.tsx` L47).

### 2. Cross-Platform Service Pattern
All `services/` files check platform before using native APIs:
```typescript
if (Capacitor.getPlatform() === 'web') {
  localStorage.setItem('key', value);  // Web fallback
} else {
  await db.run('INSERT...');            // Native SQLite
}
```
Never call native APIs (`Keyboard.hide()`, `Haptics`, `SQLite`) without this guard.

### 3. Component Data Flow
```
App.tsx (single source of truth)
├─ State: data, isPro, history, useStrictFormula
├─ Handlers: handleUpdate* (immutable updates via spread)
└─ Components: FinancialInput, BankInput, BudgetPlanner (presentational only)
```
All business logic lives in `App.tsx`. Components only receive data + callbacks via props. Use `useMemo()` for expensive calculations (e.g., BNE calculation loops through all items).

### 4. Data State Structure
- `data: BusinessData` → transactions (INCOME/EXPENSE) + accounts (CHECKING/SAVINGS/CREDIT)
- `transactions` track AR (receivable) and AP (payable) via `type` field
- `accounts` track bank balance via type; only CREDIT accounts used for debt calculation
- All amounts stored as plain numbers in state; converted to cents for DB, back to dollars on load

## Key Files & Responsibilities

| File | Purpose | Lines |
|------|---------|-------|
| `App.tsx` | State, handlers, modals, BNE calculation | 669 |
| `services/databaseService.ts` | SQLite/localStorage abstraction | 225 |
| `services/paymentService.ts` | RevenueCat integration (iOS/Android only) | 102 |
| `services/geminiService.ts` | AI insights via Gemini API | 40 |
| `types.ts` | TypeScript interfaces (no logic) | 70 |
| `config.ts` | APP_CONFIG (branding, pricing, legal) | 15 |
| `vite.config.ts` | Env var mapping: `GEMINI_API_KEY` → `process.env.API_KEY` | 20 |

## Auto-Save & Immutable Updates Pattern
- **Auto-save**: All state changes trigger `useEffect` watchers → call `saveSnapshot()` automatically
  - No manual save buttons; persistence happens on every interaction
  - `useMemo()` dependencies track `[data, isPro, history, useStrictFormula]` for recalculation on changes
- **Immutable updates**: Always use spread operator or `map()` to create new objects
  ```typescript
  // ✓ CORRECT - triggers re-render AND auto-save via useEffect
  const updated = items.map(item => item.id === id ? {...item, [field]: value} : item);
  setData(prev => ({...prev, transactions: updated}));
  ```
- **Pattern**: Handler function → immutable state update → `useEffect` fires → `saveSnapshot()` → component re-renders

## Common Workflows

### Add New Financial Input Type
1. Define interface in `types.ts` (extend `FinancialItem`)
2. Add state in `App.tsx`: `const [newData, setNewData] = useState<NewType[]>([])`
3. Create handler: `const handleUpdateNew = (items) => { setNewData(items); ... }`
4. Add to `BusinessData` interface and update `saveSnapshot`/`loadSnapshot` in `databaseService.ts`

### Test Cross-Platform
- **Web**: `npm run dev` → localStorage mock
- **Native**: Capacitor CLI build → test SQLite, Haptics, Keyboard APIs
- Always verify platform checks in services when adding native functionality

### Debug Database
```typescript
// Web: Clear mock
localStorage.removeItem('numera_mock_db');

// Native: Check schema
await db.query('SELECT * FROM sqlite_master WHERE type="table"');
```

## State Management Patterns

### Main App State
```typescript
const [data, setData] = useState<BusinessData>(INITIAL_DATA);  // Transactions + Accounts
const [isPro, setIsPro] = useState(false);                     // Pro subscription status
const [history, setHistory] = useState<HistoryRecord[]>([]);   // BNE snapshots over time
const [useStrictFormula, setUseStrictFormula] = useState(false); // Formula toggle
```

### Pro Feature Gating
- `isPro` flag gates features in UI (history chart, AI insights, etc.)
- Set via `PaywallModal` → `initiateCheckout()` → `onSuccess()` callback
- Persisted in localStorage, loaded on app mount via `useEffect`

### History Tracking
- New records created when user clicks "Save Snapshot" (modal interaction)
- Records stored with id, date, bne, assets (AR+B), liabilities (AP+C)
- Chart renders last 12 records; requires `isPro` flag to be true

## BNE Calculation Logic
Two formulas (toggled by `useStrictFormula` state):
- **Standard (Equity)**: `(AR - AP) + (B - C)` — Net Receivables PLUS Net Bank  
- **Strict**: `(AR - AP) - (B - C)` — Net Receivables MINUS Net Bank

**Where**: AR = Accounts Receivable (INCOME transactions), AP = Accounts Payable (EXPENSE transactions), B = Bank balance, C = Credit card debt

**Implementation**: Uses `useMemo()` in `App.tsx` L260-290. All math via Decimal.js for precision. Outputs `bneFormulaStr` to display formula used.

**Key insight**: BNE captures both *operational float* (AR-AP timing) + *liquid position* (B-C cash state).

## Payment Integration
- **Native (iOS/Android)**: RevenueCat SDK (`@revenuecat/purchases-capacitor` v7.7.1) handles all IAP
  - **Setup**: Replace `API_KEYS.ios`/`API_KEYS.android` in `paymentService.ts` with RevenueCat dashboard keys
  - **Product**: Single annual subscription ($10/year, configured in `config.ts`)
  - **Status**: Persisted in localStorage (`numera_pro_status`) + `isPro` state flag in App.tsx
- **Web**: Currently mock-only (returns success immediately) — **TODO**: Integrate Stripe/PayPal
- **Security**: RevenueCat SDK validates receipts server-side; client checks `isPro` flag locally for UI features

**Flow**: PaywallModal (App.tsx) → `initiateCheckout()` (paymentService.ts) → RevenueCat native dialog → `onSuccess()` callback

## Environment Variables
```bash
# vite.config.ts maps this to process.env.API_KEY and process.env.GEMINI_API_KEY
GEMINI_API_KEY="your-gemini-api-key"
```
**Fallback**: `geminiService.ts` has embedded demo key (NOT for production). Web app passes API key client-side, so restrict in Google Cloud Console by Bundle ID if deploying to production.

**Build-time mapping**: See `vite.config.ts` — env vars injected into bundle at build time via `process.env.*`

## App Store Deployment (iOS & Android)

### Prerequisites
- Node.js (already installed)
- **iOS**: CocoaPods — `sudo gem install cocoapods` (Mac only)
- RevenueCat plugin: `npm install @revenuecat/purchases-capacitor && npx cap sync`

### Asset Generation (Icons & Splash)
```bash
npm install @capacitor/assets --save-dev
# Place: assets/logo.png (1024x1024), assets/splash.png (2732x2732)
npx capacitor-assets generate
```

### Critical Build Order (NEVER SKIP STEP 1)
```bash
# 1. Build web assets FIRST (creates dist/)
npm run build

# 2. Sync to native projects (copies dist/ to iOS/Android)
npx cap sync

# 3. Open platform IDEs
npx cap open ios      # Mac only - opens Xcode
npx cap open android  # Opens Android Studio
```

**Common Error**: `Could not find web assets directory: .\dist`  
**Cause**: You ran `npx cap sync` before `npm run build`

### Pre-Build Checklist
- [ ] `paymentService.ts` — Set real RevenueCat keys in `API_KEYS.ios`/`API_KEYS.android`
- [ ] `geminiService.ts` — **SECURITY**: API key is client-side exposed
  - ⚠️ **Production**: Move to Firebase Cloud Function (recommended)
  - Alternative: Restrict API key in Google Cloud Console to your Bundle IDs

### iOS Build (Xcode - Mac Only)
1. Open: `npx cap open ios`
2. **Signing**: App → Signing & Capabilities → Select Team
3. **Display Name**: Change to "Numera"
4. **Add Capability**: `+ Capability` → "In-App Purchase"
5. **Archive**: Product → Archive → Distribute App → App Store Connect → Upload

### Android Build (Android Studio)
1. Open: `npx cap open android`
2. **Sign**: Build → Generate Signed Bundle/APK → Android App Bundle
3. **Keystore**: Create new (SAVE FILE SAFELY — cannot update app without it)
4. **Upload**: Upload `.aab` to Google Play Console (Production or Closed Testing)

### App Store Privacy Compliance (Apple)
- **Data Used to Track You**: No
- **Data Linked to You**: Purchases (RevenueCat User ID), Financial Info (local-only, not server-linked)

### Troubleshooting
| Error | Fix |
|-------|-----|
| `Could not find web assets directory` | Run `npm run build` first |
| `Cocoapods not found` (iOS) | `sudo gem install cocoapods` (Mac) |
| `Google Service Info Plist not found` | If using Firebase: Download from Console → Place in `ios/App/App` or `android/app` |

## Gotchas
- ✗ Don't use `number` for money math (use Decimal.js)
- ✗ Don't call native APIs without platform check
- ✗ Don't add Redux/Context (keep state in App.tsx)
- ✓ Use `crypto.randomUUID()` for IDs
- ✓ Use `triggerHaptic()` for user feedback (gracefully fails on web)
- ✓ All amounts in DB are stored as cents (multiply by 100 on save, divide on load)
