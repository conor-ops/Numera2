# Numera Development Guide

## Quick Start
```bash
npm install
$env:GEMINI_API_KEY="your-key"  # PowerShell (or: export GEMINI_API_KEY="key")
npm run dev                      # Runs on http://localhost:3000
```

## Architecture Overview
<<<<<<< HEAD
<<<<<<< HEAD
**Numera** is a cash flow management tool for small business owners. It tracks receivables (AR), payables (AP), and bank balances to calculate **Business Net Equity (BNE)** — a proprietary metric combining operational float with liquid cash position.

**Core Stack**: React 19 + TypeScript + Vite + Capacitor 5 + Stripe (web) / RevenueCat (iOS/Android) + Tailwind + SQLite + Decimal.js  
**Single-Page App**: All business logic in `App.tsx` (768 lines); components are presentational only  
**Platform Bridge**: Service layer abstracts platform differences — `Capacitor.getPlatform()` routes to localStorage (web) or SQLite (native)  
**State**: Pure React hooks (no Redux/Context), auto-persists to DB on every change via `useEffect` watchers  
**Money Math**: ALWAYS use Decimal.js (never plain JavaScript arithmetic); DB stores cents, display as dollars
=======
=======
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
Single-page React app (App.tsx + modular components) with cross-platform service layer.

**Core Stack**: React 19 + TypeScript + Vite + Capacitor 5 + Tailwind + SQLite  
**Key Pattern**: Platform-aware services — web uses localStorage, native uses SQLite  
**State**: Pure React hooks (no Redux), auto-saves on every change  
**BNE (Business Net Equity)**: Core calculation = Total Bank + Net Receivables - Total Credit Debt
<<<<<<< HEAD
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
=======
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a

## Critical Conventions

### 1. Money Math = Decimal.js (ALWAYS)
```typescript
// ✓ CORRECT - use Decimal for all calculations
const total = items.reduce((acc, i) => acc.plus(new Decimal(i.amount || 0)), new Decimal(0));
const forDisplay = total.toNumber().toLocaleString('en-US', { minimumFractionDigits: 2 });

// ✗ WRONG - JavaScript arithmetic causes float errors
const total = items.reduce((sum, i) => sum + i.amount, 0);
```
<<<<<<< HEAD
<<<<<<< HEAD
**Why**: Floating-point errors compound across transactions (0.1 + 0.2 ≠ 0.3 in JavaScript)  
**DB Storage**: All amounts stored as `amount_cents` (integers) to eliminate float errors
  - Save: `Math.round(dollars * 100)` → cents
  - Load: `cents / 100` → dollars  
  - See [services/databaseService.ts](../services/databaseService.ts#L107) for the pattern

**Display**: Use `.toLocaleString()` for currency (see [components/BankInput.tsx](../components/BankInput.tsx))

### 2. Cross-Platform Service Pattern (Web vs Native)
All `services/` files MUST check platform before using native APIs:
=======
=======
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
**Storage**: All DB columns store cents as integers (`amount_cents`) — multiply by 100 on save, divide on load (see [databaseService.ts](../services/databaseService.ts))  
**Components**: `.toLocaleString()` for display formatting (see [BankInput.tsx](../components/BankInput.tsx))

### 2. Platform Abstraction Pattern
All services check `Capacitor.getPlatform()` before accessing device APIs:
<<<<<<< HEAD
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
=======
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
```typescript
if (Capacitor.getPlatform() === 'web') {
  // LocalStorage fallback
  localStorage.setItem('key', value);
} else {
  // Native SQLite (iOS/Android)
  await db.run('INSERT INTO ...', params);
}
```
<<<<<<< HEAD
<<<<<<< HEAD
**Never** call native APIs (`Keyboard.hide()`, `Haptics`, `SQLite`) without this guard — will crash on web.

Examples:
- [services/databaseService.ts](../services/databaseService.ts#L6) — SQLite vs localStorage
- [services/paymentService.ts](../services/paymentService.ts#L30) — Stripe (web) vs RevenueCat (native)
- [services/hapticService.ts](../services/hapticService.ts) — Gracefully skips on web

### 3. Component Data Flow Architecture
```
App.tsx (single source of truth - 768 lines)
├─ State: data, isPro, history, useStrictFormula
├─ Handlers: handleUpdate* (immutable updates via spread)
├─ Calculations: useMemo for BNE, AR/AP sums
└─ Presentational Components:
   ├─ FinancialInput (INCOME/EXPENSE form)
   ├─ BankInput (account balance form)
   ├─ BudgetPlanner (targets UI)
   ├─ StripePaymentModal (web checkout)
   ├─ PaywallModal (native/web pro tier)
   └─ ErrorBoundary (crash recovery)
```
**Key Rule**: Components only receive data + callbacks via props. NO direct API calls, NO state mutations, NO side effects in components — all business logic stays in `App.tsx`.

**Immutable Updates**: Always use spread operator or `map()` — triggers re-render AND auto-save via `useEffect`:
```typescript
// ✓ CORRECT
const updated = items.map(item => item.id === id ? {...item, [field]: value} : item);
setData(prev => ({...prev, transactions: updated}));  // Triggers useEffect → saveSnapshot()

// ✗ WRONG - Direct mutation won't save
data.transactions[0].amount = 100;  // React won't detect change
setData(data);
```

### 4. Data State Structure & Storage
```typescript
// In-Memory (App.tsx state)
interface BusinessData {
  transactions: Transaction[];  // INCOME or EXPENSE type
  accounts: BankAccount[];      // CHECKING, SAVINGS, or CREDIT type
}

// DB Storage (databaseService.ts)
- transactions: id, amount_cents, type, name, date_occurred
- accounts: id, bank_name, name, amount_cents, type
- settings: key, value (for isPro flag, formula toggle, etc.)
- history: id, date_iso, bne_cents, assets_cents, liabilities_cents
```

**Amount Flow**:
- Display state: `data.transactions[0].amount = 8500` (dollars)
- DB save: Convert to cents: `Math.round(8500 * 100) = 850000`
- DB load: Convert back: `850000 / 100 = 8500`

### 5. Input Validation & Sanitization Pattern
All user inputs routed through `utils/validation.ts` to prevent injection/overflow:
```typescript
import { parseAmount, sanitizeText } from '../utils/validation';

// parseAmount: string/number → valid currency (0-999M, max 2 decimals, NaN safe)
updateAccount(id, 'amount', parseAmount(value));  // Auto-validates & rounds

// sanitizeText: string → XSS-safe, truncated to 100 chars
updateAccount(id, 'name', sanitizeText(value));
```
**Why**: Client-side validation prevents SQL injection via SQLite, handles edge cases (NaN, negative, overflow), and rounds floats safely to 2 decimals before storage. See [BankInput.tsx](../components/BankInput.tsx) for component integration example.

**Transaction Types**:
- `INCOME` → Accounts Receivable (AR) — money owed TO you
- `EXPENSE` → Accounts Payable (AP) — money you OWE

**Account Types**:
- `CHECKING` / `SAVINGS` → Bank balance (positive = assets)
- `CREDIT` → Credit card debt (positive = liability to subtract)

## Key Files & Responsibilities

| File | Purpose | Lines |
|------|---------|-------|
| `App.tsx` | State, handlers, modals, BNE calculation | 714 |
| `services/databaseService.ts` | SQLite/localStorage abstraction | 213 |
| `services/paymentService.ts` | RevenueCat integration (iOS/Android only) | 107 |
| `services/geminiService.ts` | AI insights via Gemini API | 30 |
| `types.ts` | TypeScript interfaces (no logic) | 52 |
| `utils/validation.ts` | Input validation & sanitization (parseAmount, sanitizeText) | 111 |
| `config.ts` | APP_CONFIG (branding, pricing, legal) | 15 |
| `vite.config.ts` | Env var mapping: `GEMINI_API_KEY` → `process.env.API_KEY` | 20 |
=======
=======
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
Never assume platform — guard all: `Keyboard`, `Haptics`, `SQLite`, `StatusBar` calls.

### 3. State & Component Data Flow
- **Source of truth**: [App.tsx](../App.tsx) centralized state (`data`, `isPro`, `history`, `useStrictFormula`)
- **Handlers**: `handleUpdate*` methods use immutable spread pattern → `useEffect` watchers trigger auto-save
- **Components**: Presentational only (props: `items`, `onUpdate`) — no business logic
- **Expensive calculations**: Wrap in `useMemo([data, isPro, ...deps])` (BNE loops all accounts/transactions)

### 4. Business Data Model
```typescript
BusinessData = {
  transactions: [],  // INCOME (AR) / EXPENSE (AP), type field distinguishes
  accounts: []       // CHECKING/SAVINGS/CREDIT; only CREDIT used for debt
}
```
- AR/AP tracked by `type: 'INCOME' | 'EXPENSE'` + `date_occurred` for recurrence checks
- Bank total = sum of CHECKING + SAVINGS only
- Credit debt = sum of CREDIT accounts (subtracted in BNE formula)

### 5. Recurring Transaction Processing
- Stored in localStorage via [recurringService.ts](../services/recurringService.ts)
- Frequencies: `daily|weekly|biweekly|monthly|quarterly|annually`
- `processPendingRecurring()` checks `isDueToday()` and auto-adds transactions to main list
- Call this in `App.tsx` `useEffect` on init to apply pending transactions

## Key Files & Responsibilities

| File | Purpose |
|------|---------|
| [App.tsx](../App.tsx) | State, handlers, calculation, modals (893 lines) |
| [types.ts](../types.ts) | Interfaces: `BusinessData`, `Transaction`, `BankAccount`, `CalculationResult` |
| [services/databaseService.ts](../services/databaseService.ts) | SQLite (native) / LocalStorage (web) abstraction |
| [services/recurringService.ts](../services/recurringService.ts) | Recurring transaction logic & scheduling |
| [services/paymentService.ts](../services/paymentService.ts) | Stripe payment link (opens in new tab) |
| [services/geminiService.ts](../services/geminiService.ts) | Calls `/api/generateFinancialInsight` Cloud Function |
| [services/hapticService.ts](../services/hapticService.ts) | Platform-safe haptic feedback wrapper |
| [config.ts](../config.ts) | `APP_CONFIG`: branding, pricing, legal text |
| [components/FinancialInput.tsx](../components/FinancialInput.tsx) | Reusable INCOME/EXPENSE input list |
| [components/BankInput.tsx](../components/BankInput.tsx) | Bank account list with type selector |
<<<<<<< HEAD
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
=======
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a

## Auto-Save Pattern
1. State change → `setData(newData)` (immutable update)
2. React re-renders with new state
3. `useEffect([data, isPro, history, useStrictFormula])` fires
4. `saveSnapshot(data)` called → localStorage or SQLite
5. No manual save buttons — transparency on every keystroke

## Pro Feature Limits (Free Tier)
- Max 1 credit card account (Pro: unlimited)
- Max 3 bank accounts (Pro: unlimited)
- Upgrade triggers: disabled "+" button calls `onUpgradeClick()` → Stripe modal

## Integration Points
- **Gemini AI**: POST to `/api/generateFinancialInsight` with `{ calculations, bankBreakdown }`
- **Stripe**: Direct payment link (config in [paymentService.ts](../services/paymentService.ts))
- **Capacitor**: Native APIs only on iOS/Android (web falls back to localStorage)

## Common Workflows

### Add New Input Field
1. Extend interface in [types.ts](../types.ts)
2. Add state in [App.tsx](../App.tsx): `useState`
3. Create `handleUpdateNew()` handler
4. Add to [databaseService.ts](../services/databaseService.ts) schema + `saveSnapshot()`/`loadSnapshot()`

### Modify BNE Calculation
Edit `useMemo()` block in [App.tsx](../App.tsx) — verify calculation formula matches current `CalculationResult` structure

### Debug Cross-Platform
- Web: Open DevTools → LocalStorage tab (`numera_web_db` key)
- Native: Run `capacitor run ios` or `capacitor run android` → check SQLite via native debugger

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
