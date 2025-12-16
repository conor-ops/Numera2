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
DB stores cents (`amount_cents`) to avoid float errors; divide by 100 when loading (see `databaseService.ts` L107-130).

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
└─ Components: FinancialInput, BankInput (presentational only)
```
All business logic lives in `App.tsx`. Components only receive data + callbacks.

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

## BNE Calculation Logic
Two formulas (toggled by `useStrictFormula` state):
- **Standard**: `(AR - AP) + (B - C)` — Net Receivables PLUS Net Bank  
- **Strict**: `(AR - AP) - (B - C)` — Net Receivables MINUS Net Bank

See `App.tsx` L260-290 for full implementation using Decimal.js.

## Payment Integration
- **Native**: RevenueCat SDK (`@revenuecat/purchases-capacitor` v7.7.1)
- **Web**: TODO - needs Stripe/PayPal (currently returns mock success)
- **Setup**: Replace `API_KEYS.ios`/`API_KEYS.android` in `paymentService.ts` with RevenueCat dashboard keys
- **Pro status**: Stored in localStorage (`numera_pro_status`) + `isPro` state flag

## Environment Variables
```bash
# vite.config.ts maps this to process.env.API_KEY
GEMINI_API_KEY="your-gemini-api-key"
```
**Fallback**: `geminiService.ts` has embedded demo key (NOT for production).

## Gotchas
- ✗ Don't use `number` for money math (use Decimal.js)
- ✗ Don't call native APIs without platform check
- ✗ Don't add Redux/Context (keep state in App.tsx)
- ✓ Use `crypto.randomUUID()` for IDs
- ✓ Use `triggerHaptic()` for user feedback (gracefully fails on web)
- ✓ All amounts in DB are stored as cents (multiply by 100 on save, divide on load)
