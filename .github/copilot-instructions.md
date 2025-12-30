npm run dev                      # Runs on http://localhost:3000
data.transactions[0].amount = 100;  // React won't detect change
npx capacitor-assets generate
npm run build
npx cap sync

# Numera2 AI Coding Agent Instructions

## Project Overview
Numera2 is a cross-platform cash flow management tool for small businesses. It tracks receivables (AR), payables (AP), and bank balances to compute **Business Net Equity (BNE)**, a proprietary metric. The app is a single-page React 19 + TypeScript app, built with Vite and Capacitor 5 for native/web, using Tailwind, SQLite, and Decimal.js for money math.

## Architecture & Patterns
- **Single Source of Truth:** All business logic and state live in [App.tsx](../../App.tsx). Components are presentational only and receive data/callbacks via props. No Redux/Context.
- **Platform Abstraction:** All services in [services/](../../services/) check `Capacitor.getPlatform()` before using native APIs (e.g., SQLite, Haptics, Keyboard). Web uses localStorage, native uses SQLite.
- **Money Math:** All calculations use Decimal.js. Never use JS number arithmetic for currency. DB stores all amounts as integer cents (`amount_cents`). See [databaseService.ts](../../services/databaseService.ts).
- **Auto-Persistence:** State changes trigger auto-save to storage via `useEffect` watchers. No manual save buttons.
- **Immutable Updates:** Always use spread or `map()` for state updates. Never mutate arrays/objects directly.
- **Input Validation:** All user input is sanitized/validated before storage. See [utils/validation.ts](../../utils/validation.ts) if present.

## Key Files
- [App.tsx](../../App.tsx): State, handlers, BNE calculation, modals, feature gating
- [services/databaseService.ts](../../services/databaseService.ts): SQLite/localStorage abstraction, snapshot logic
- [services/recurringService.ts](../../services/recurringService.ts): Recurring transaction logic
- [services/paymentService.ts](../../services/paymentService.ts): Stripe/RevenueCat integration
- [services/geminiService.ts](../../services/geminiService.ts): AI insights (Gemini API)
- [components/BankInput.tsx](../../components/BankInput.tsx), [components/FinancialInput.tsx](../../components/FinancialInput.tsx): Presentational input lists
- [types.ts](../../types.ts): TypeScript interfaces for all data

## Critical Conventions
- **Money:**
  - Use `Decimal` for all math: `acc.plus(new Decimal(i.amount || 0))`
  - Store as cents in DB: `Math.round(dollars * 100)` on save, `/ 100` on load
  - Display with `.toLocaleString()`
- **Platform Guards:**
  - Always check `Capacitor.getPlatform()` before native API calls (e.g., Haptics, SQLite, Keyboard)
- **Component Data Flow:**
  - Components never mutate state or call APIs directly; all logic in `App.tsx`
- **Recurring Transactions:**
  - Managed in [services/recurringService.ts](../../services/recurringService.ts), auto-applied on app init
- **Pro Feature Gating:**
  - `isPro` flag gates features (history, AI, export, account limits). Set via paywall modal and persisted in localStorage.

## Developer Workflows
- **Quick Start:**
  1. `npm install`
  2. Set `GEMINI_API_KEY` in env (see [vite.config.ts](../../vite.config.ts))
  3. `npm run dev` (web) or use Capacitor for native
- **Build for Native:**
  1. `npm run build` (must run before `npx cap sync`)
  2. `npx cap sync`
  3. `npx cap open ios` or `npx cap open android`
- **Debugging:**
  - Web: Inspect localStorage (`numera_mock_db`)
  - Native: Inspect SQLite via device tools
- **Add New Field:**
  1. Update interface in [types.ts](../../types.ts)
  2. Add state/handler in [App.tsx](../../App.tsx)
  3. Update [databaseService.ts](../../services/databaseService.ts) for persistence

## Integration Points
- **Gemini AI:** POST to `/api/generateFinancialInsight` (see [geminiService.ts](../../services/geminiService.ts))
- **Stripe/RevenueCat:** Payment logic in [paymentService.ts](../../services/paymentService.ts)
- **Capacitor:** All native APIs guarded by platform check

## Gotchas
- Never use JS number for money math
- Never call native APIs without platform check
- Never mutate state directly; always use immutable updates
- All DB amounts are cents (multiply/divide by 100)

---
If any conventions or workflows are unclear, consult [App.tsx](../../App.tsx) and [services/databaseService.ts](../../services/databaseService.ts) for the authoritative patterns.
