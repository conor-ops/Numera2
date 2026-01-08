# VS Code Copilot - Solventless Project Coordination

**Date:** January 08, 2026
**Project:** Solventless (formerly Numera)
**Workspace:** `C:\Users\conor\OneDrive\Documents\GitHub\Numera2`

---

## 🎯 Mission Overview

You are working on **Solventless**, a financial strategic liquidity dashboard for business owners.
The core philosophy is **"Precision Strategic Liquidity Control"**.
We focus on **BNE (Business Net Exact)**, a proprietary solvency metric.

**Current Status:**
- ✅ **Rebranded:** All "Numera" references removed. Now "Solventless".
- ✅ **Design System:** "Swiss Style" / Brutalist. High contrast (Black/White), thick borders (`border-2 border-black`), shadows (`shadow-swiss`), monospace fonts. **NO ROUNDED CORNERS.**
- ✅ **Mobile-First:** Wrapped with Capacitor for iOS/Android.
- ✅ **Paywalls:** Strictly enforced for AI features.
- ✅ **Deployed:** `https://solventless-finance.web.app`

---

## 🔧 Architectural Rules (CRITICAL)

### 1. Component Structure
- **Flat Architecture:** All components live in `src/components/`.
- **Key Components:**
    - `App.tsx`: Main state hub. Manages `isPro`, `data`, and global navigation.
    - `BusinessTools.tsx`: The "Mega-Component" that handles the Tools Menu (Portal) and individual tool views (Lab, Scorer, Inventory, Pricing).
    - `ChatBot.tsx`: The AI Co-pilot (Gemini).
    - `RunwayPredictor.tsx`: The Cash Flow survival chart.

### 2. The Paywall Protocol
**Rule:** Advanced AI features are **PRO ONLY**.
- **State:** `isPro` (boolean) passed from `App.tsx`.
- **Action:** If a user tries to access a Pro feature and `!isPro`, call `onShowPaywall()`.
- **Enforced Areas:**
    - **Expansion Lab:** View access blocked.
    - **Opportunity Scorer:** View access blocked.
    - **Contract Analysis:** Upload action blocked.
    - **ChatBot:** Voice input and File upload blocked. Text chat is blocked for sending.
    - **Runway Predictor:** "Stress Test" analysis blocked.

### 3. Styling Guidelines (Swiss Style)
- **Borders:** `border-2 border-black` (or `border-4` for containers).
- **Shadows:** `shadow-swiss` (Custom Tailwind class: hard black drop shadow).
- **Colors:**
    - Backgrounds: White (`bg-white`) or Light Gray (`bg-gray-50`).
    - Accents: Brand Blue (`text-brand-blue`), Signal Green (`bg-green-500`), Alert Red (`bg-red-500`).
- **Typography:**
    - Headings: `font-black uppercase tracking-tight`.
    - Data: `font-mono font-bold`.
- **Interaction:**
    - **Haptics:** ALways use `triggerHaptic(ImpactStyle.Medium)` on button clicks.

---

## 🚀 Current Development Focus

### Restored Features
We have just restored strict paywall enforcement on the following:
1.  **Business Tools:** The "Lab" and "Scorer" buttons in the Portal now check `isPro` before opening.
2.  **Contract Analysis:** File upload checks `isPro`.
3.  **ChatBot:** Sending text messages, voice recording, and file uploads now check `isPro`.

### Next Tasks (For You)
- **Verify Mobile UX:** Ensure the paywall modal looks good on small screens.
- **Feature Polish:** The "Inventory" and "Pricing" tools are currently free. Maintain them as "Entry Level" features.

---

## 🛠️ Developer Cheat Sheet (Operational Quirks)

### 1. Dependency Management
- **Issue:** `rollup` binary conflict and Capacitor peer deps.
- **Fix:** ALWAYS use `npm install --legacy-peer-deps`.
- **Vite Config:** `vite.config.ts` has specific `optimizeDeps` for `recharts`. **DO NOT REMOVE** or the production build will crash.

### 2. Deployment
- **Target:** `solventless-finance` (Project ID: `solventless-7d0ef`).
- **Command:** `firebase deploy --only hosting:solventless-finance`
- **Note:** Do NOT deploy to the old `numera` target.

### 3. AI Service (`services/geminiService.ts`)
- This service wraps the Google Generative AI client.
- It expects a valid API key (handled in code/env).
- **Usage:** Call high-level functions like `generateFinancialInsight` or `scoreOpportunity`, do not call the raw API directly from components.

### 4. Component "Gotchas"
- **`BusinessTools.tsx`:** This is a **Router**. It switches between 'PORTAL', 'LAB', 'SCORER', etc. using `activeView`. When adding a new tool, add it to the `activeView` type union and create a new `if (activeView === 'NEW_TOOL')` block.
- **`ChatBot.tsx`:** Stores history locally in the component state. It does not persist to DB currently (by design, for privacy/simplicity).

---

## 🤝 Handoff Instruction
When picking up a task:
1.  **Read `App.tsx`** to understand the global state.
2.  **Read `BusinessTools.tsx`** if working on specific tools.
3.  **Respect the Swiss Style.** Do not add rounded buttons or soft shadows.
4.  **Test Paywalls.** Assume every AI feature needs a lock.

**"Solvency is not a metric. It is a survival skill."**
