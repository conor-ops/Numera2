# Numera Codebase Guide for AI Agents

## Project Overview
**Numera** is a precision financial clarity tool built with React + TypeScript, designed for small business owners to understand their true financial position. The app calculates **Business Net Exact (BNE)**, a compound financial metric combining liquid assets, receivables, and payables.

### Core Stack
- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS (custom Swiss-style design with black borders, bold typography)
- **Persistence**: Capacitor SQLite (native) + localStorage (web fallback)
- **Mobile**: Capacitor 5 (iOS/Android support)
- **AI**: Google Gemini API for financial insights
- **Charts**: Recharts for data visualization
- **Payments**: RevenueCat (native subscriptions) + web fallback (Stripe/PayPal needed)

**Key Files**:
- `App.tsx` - Main business logic, state management, modals
- `config.ts` - Brand, pricing, legal config (stored in APP_CONFIG)
- `types.ts` - Core business domain types
- `services/` - Database, AI, payments, haptics (platform-aware utilities)

## Architecture Patterns

### 1. State Management & Persistence
- **React hooks only** - No Redux/Context API (keep it simple)
- `useEffect` initialization chain: setupDatabase → loadSnapshot → loadProStatus → loadHistory
- **Auto-save on data change**: Whenever `data` object updates, it auto-persists to SQLite/localStorage
- **Derived state**: Use `useMemo` for expensive calculations (see `calculations` object in App.tsx L260+)
- **LocalStorage keys**: `numera_pro_status` (pro subscription flag), `numera_mock_db` (web mock)

### 2. Cross-Platform Compatibility
All services must account for **web vs. native** platform differences:
```typescript
if (Capacitor.getPlatform() === 'web') {
  // Web: Use localStorage, skip native APIs
} else {
  // Native: Use SQLite, Haptics, Keyboard APIs
}
```
- `databaseService.ts` - SQLite on native, localStorage mock on web
- `hapticService.ts` - Calls native Haptics (gracefully fails on web)
- `App.tsx` - Keyboard.hide() only on native (L630)

### 3. Precision Financial Calculations
- **All monetary amounts stored in cents** in SQLite (`amount_cents`, `bne_cents`) to avoid floating-point errors
- **Decimal.js** for client-side arithmetic (see App.tsx L260+, components/FinancialInput.tsx)
  - Example: `new Decimal(item.amount || 0).plus(...)`
  - Always convert back to dollars for display: `.toNumber().toFixed(2)`
- **BNE Formulas** (switchable):
  - **Strict**: `(AR - AP) - (B - C)` = Net Receivables MINUS Net Bank
  - **Equity**: `(AR - AP) + (B - C)` = Net Receivables PLUS Net Bank
  - Toggle: `useStrictFormula` state controls which formula (L219)

### 4. Component Data Flow
```
App.tsx (state: data, isPro, history)
├─ FinancialInput (Income/Expenses) → handleUpdateTransactions
├─ BankInput (Bank + Credit accounts) → handleUpdateBanks + handleUpdateCredit
└─ Modals: PaywallModal, HistoryModal
```
- Components are **presentational** - no business logic
- All handlers in App.tsx update state immutably (spread operator)
- Types enforced via TypeScript interfaces (`Transaction`, `BankAccount`, `CalculationResult`)

### 5. Payment & Monetization
- `paymentService.ts` - **RevenueCat integration** for iOS/Android; mocked on web
- **Platform-specific**: Fetches real prices from App Store (iOS) / Google Play (Android)
- Pro status tracked via `checkSubscriptionStatus()` + `isPro` flag in App state
- **Entitlement ID**: Must match RevenueCat dashboard entry `'pro_access'`
- Paywall triggered on PDF export; success handler calls `handleProUpgrade()`
- **Web fallback**: Stripe/PayPal integration needed for web checkout
- **Setup**: Replace `API_KEYS.ios` and `API_KEYS.android` with actual RevenueCat keys from dashboard

### 6. Haptics & UX
- `triggerHaptic()` on all user actions (add/remove items, form focus, button clicks)
- Different impact styles: `Light` (input), `Medium` (add/remove), `Heavy` (big actions like export/clear)
- Gracefully fails on web (try/catch, fail silently in debug logs)

## Developer Workflows

### Running Locally
```bash
npm install                    # Install dependencies
export GEMINI_API_KEY="..."    # Set Gemini API key
npm run dev                    # Start Vite dev server (http://localhost:5173)
npm run build                  # Production build
npm run preview               # Preview production build
```

### Subscription Setup (RevenueCat)
1. Create RevenueCat account and register iOS + Android apps
2. Replace `API_KEYS.ios` and `API_KEYS.android` in `paymentService.ts`
3. Create Entitlement ID: `pro_access` in RevenueCat dashboard
4. Create Annual Package offering with `pro_access` entitlement
5. Call `initializePayments()` in App.tsx useEffect (during init)
6. Call `checkSubscriptionStatus()` to set `isPro` flag on app start

### Database Schema (SQLite)
Four tables with auto-migration:
- `accounts` - Bank and credit accounts (id, bank_name, name, amount_cents, type)
- `transactions` - Income/Expenses (id, amount_cents, type, name, date_occurred)
- `settings` - Key-value config (future use)
- `history` - Balance snapshots (id, date_iso, bne_cents, assets_cents, liabilities_cents)

All amounts stored in cents; divide by 100 when displaying.

### Testing Payments Locally
**Web**: Mock payment returns success after delay. To implement real checkout:
1. Integrate Stripe SDK or PayPal integration
2. Test on web with real payment provider

**Native**: Test with RevenueCat sandbox credentials:
1. Set test API keys in `paymentService.ts`
2. Build with Capacitor CLI and test on device/simulator
3. Verify `checkSubscriptionStatus()` returns true after purchase
4. Check localStorage/SQLite persistence across session restart

## Key Conventions & Gotchas

### Decimal.js Required
- **Never** use plain JavaScript `number` for money math
- Always use Decimal.js: `new Decimal(value).plus(...).toNumber()`
- See App.tsx L260-275 for calculation pattern

### ID Generation
- Use `crypto.randomUUID()` for new items (already available in modern browsers + Capacitor)
- Example: `id: crypto.randomUUID()` in FinancialInput L20

### TypeScript Enums
- `AccountType` enum (L8-11 types.ts): CHECKING, SAVINGS, CREDIT
- Use for filtering: `data.accounts.filter(a => a.type !== AccountType.CREDIT)`

### API Key Management
- `GEMINI_API_KEY` via `process.env.API_KEY` (see geminiService.ts L3)
- Fallback to embedded demo key (NOT for production)
- Set env var before running: `export GEMINI_API_KEY="sk-..."`

### Styling
- Tailwind CSS with Swiss design system (bold fonts, black borders, high contrast)
- Custom shadow: `shadow-swiss` (black box shadow, see vite.config.ts)
- No external CSS files - all inline classes

## Common Tasks

### Adding a New Financial Input Type
1. Define interface in `types.ts` (extend `FinancialItem`)
2. Add component prop in App.tsx
3. Create handler: `handleUpdate[Name]` following pattern of `handleUpdateTransactions`
4. Add SQLite table in `databaseService.ts` if persisting
5. Update `saveSnapshot` and `loadSnapshot` functions

### Fixing a Database Issue
1. Call `setupDatabase()` to recreate schema
2. Check `databaseService.ts` for amount_cents conversions
3. Test on web (localStorage mock) first, then native
4. Clear localStorage: `localStorage.removeItem('numera_mock_db')`

### Adding an AI Feature
1. Call `generateFinancialInsight()` (already done for insights)
2. Ensure GEMINI_API_KEY is set
3. Pass `CalculationResult` + formatted context string
4. Handle errors gracefully (show default message if API fails)

### Testing Cross-Platform
- **Web**: `npm run dev` → test localStorage fallback
- **Mobile**: Use Capacitor CLI to build and test native features
- Always wrap native APIs with `Capacitor.getPlatform() !== 'web'` check

## File Structure Reference
```
App.tsx (669 lines) - Main app, state, calculations, modals
├─ INITIAL_DATA: Sample business data
├─ PaywallModal: Pro subscription UI
├─ HistoryModal: Balance history viewer
└─ App: Root component, all handlers, render loop

components/
├─ FinancialInput.tsx (120 lines) - Income/Expense inputs with Decimal.js math
├─ BankInput.tsx - Bank and credit card inputs
└─ BudgetPlanner.tsx - Budget tracking (if implemented)

services/
├─ databaseService.ts (225 lines) - SQLite + localStorage abstraction
├─ geminiService.ts (40 lines) - Gemini API financial insights
├─ paymentService.ts (30 lines) - Payment abstraction (mocked)
└─ hapticService.ts (25 lines) - Haptics abstraction

types.ts - All TypeScript interfaces (FinancialItem, Transaction, BankAccount, etc.)
config.ts - APP_CONFIG (branding, pricing, legal)
```

## Known Limitations & TODOs
- **Payments**: RevenueCat integrated for native (iOS/Android); web needs Stripe/PayPal SDK
- **Budget Planner**: Component exists but not integrated
- **Export**: PDF generation promised but not implemented
- **History**: Basic table view - could add charts/trends
- **Offline mode**: Works on native via SQLite; web requires localStorage
