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
