# VS Code Copilot - Solventless2 Project Coordination

**Date:** December 18, 2025  
**Project:** Solventless2 - Financial Clarity Platform  
**Workspace:** `C:\Users\conor\Documents\GitHub\Solventless2\Solventless2.code-workspace`

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

### restored Features
We have just restored strict paywall enforcement on the following:
1.  **Business Tools:** The "Lab" and "Scorer" buttons in the Portal now check `isPro` before opening.
2.  **Contract Analysis:** File upload checks `isPro`.
3.  **ChatBot:** Sending text messages, voice recording, and file uploads now check `isPro`.

### Next Tasks (For You)
- **Verify Mobile UX:** Ensure the paywall modal looks good on small screens.
- **Feature Polish:** The "Inventory" and "Pricing" tools are currently free. Maintain them as "Entry Level" features.

---

## 📝 Code Context

**State Management (App.tsx):**
```typescript
const [isPro, setIsPro] = useState(false);
// ...
<BusinessTools 
  isPro={isPro} 
  onShowPaywall={() => setShowPaywall(true)} 
  // ... 
/>
```

**Tool Implementation (BusinessTools.tsx):**
```typescript
// Example of Paywall Gate
<button onClick={() => isPro ? setActiveView('LAB') : onShowPaywall()} ...>
```

**Gemini AI (services/geminiService.ts):**
- Handles all AI logic.
- **Cost:** Expensive. This is WHY we enforce the paywall.

---

## 🤝 Handoff Instruction
When picking up a task:
1.  **Read `App.tsx`** to understand the global state.
2.  **Read `BusinessTools.tsx`** if working on specific tools.
3.  **Respect the Swiss Style.** Do not add rounded buttons or soft shadows.
4.  **Test Paywalls.** Assume every AI feature needs a lock.

**"Solvency is not a metric. It is a survival skill."**