# VS Code Copilot - Solventless Project Coordination

**Date:** January 8, 2026
**Project:** Solventless - The Job Site Profit Partner
**Workspace:** `C:\Users\conor\OneDrive\Documents\GitHub\Numera2\Numera2.code-workspace`

---

## 🎯 Mission Overview

You are working on **Solventless**, a financial dashboard being transformed into a **"Job Site Profit Partner"** for service-based contractors.
The core philosophy is to provide tools that seamlessly integrate into the **"Contractor Core Loop"**: Quoting -> Execution -> Invoicing -> Profit Analysis.

**Current Status:**
- ✅ **Strategic Pivot:** The project has shifted from a general finance app to a specialized tool for contractors.
- ✅ **Design System:** "Swiss Style" / Brutalist. High contrast, `border-2 border-black`, `shadow-swiss`. **NO ROUNDED CORNERS.**
- ✅ **Architecture:** Client-side only (React/Capacitor), using `localStorage` or SQLite. No backend database.
- ✅ **Paywalls:** Strictly enforced for Pro features to drive upgrades.

---

## 🔧 Architectural Rules (CRITICAL)

### 1. The Paywall Protocol
**Rule:** Advanced features are **PRO ONLY**. This is driven by the cost of the Gemini AI and the need to fund development.
- **State:** `isPro` (boolean) passed from `App.tsx`.
- **Action:** If a user tries to access a Pro feature and `!isPro`, you MUST call the `onShowPaywall()` prop.
- **Freemium Hooks:** New features must have clear limitations for free users (e.g., "3 free quotes per month").

### 2. Styling Guidelines (Swiss Style)
- **Borders:** `border-2 border-black` (or `border-4` for containers).
- **Shadows:** `shadow-swiss` (Custom Tailwind class: hard black drop shadow).
- **Colors:** White/Gray backgrounds, Brand Blue accents, Green/Red for status.
- **Typography:** `font-black uppercase` for headings, `font-mono` for data.
- **Interaction:** Use `triggerHaptic` on button clicks for a better native feel.

### 3. Data Flow
- **`App.tsx` is the Hub:** It manages all primary state (`data`, `isPro`, etc.).
- **Components are Presentational:** They receive data and callbacks via props. Do not add business logic to low-level components.
- **Services are Abstracted:** Services in `src/services/` must use `Capacitor.getPlatform()` to differentiate between web (`localStorage`) and native (SQLite) implementations.

---

## 🚀 Current Development Focus

Our immediate goal is to build the foundational tools for the "Contractor Core Loop."

### Next Tasks (For You)
1.  **Implement Quote & Invoice Generator:**
    *   Build a new component that allows users to create a job cost estimate.
    *   Use `jsPDF` or a similar library to generate a client-side PDF quote from that estimate.
    *   Add functionality to convert a quote into an invoice, which should then be added to the `transactions` array in `App.tsx` as an Accounts Receivable item.
    *   Enforce the freemium limit (e.g., 3 free quotes).

2.  **Implement Simple Job Status Tracker:**
    *   Create a new component that displays jobs in a simple Kanban-style board (e.g., Quoted, Scheduled, Invoiced, Paid).
    *   This should be a purely visual tool for tracking the financial pipeline.

3.  **Refactor `App.tsx` (Ongoing):**
    *   As you add new features, look for opportunities to extract complex business logic from `App.tsx` into custom hooks (e.g., `useBusinessCalculations`).

### The Intelligence Layer (Pro-Tier Focus)
The ultimate goal is to build a proactive **Intelligence Layer** that transforms the app from a passive tracker into an active business partner. This is the core justification for the Pro subscription.

- **Concept:** Automatically connect data points from across the app (quotes, jobs, expenses) to provide timely, actionable advice.
- **Pillars:** This layer is structured around four pillars:
    1.  **Pipeline & Sales Intelligence** (e.g., "Stale Quote" nudges)
    2.  **Real-Time Job Profitability Alerts** (e.g., "Budget Creep" warnings)
    3.  **Cash Flow & Financial Health** (e.g., "Cash Low" projections)
    4.  **Administrative Automation** (e.g., "Overdue Invoice" reminders)
- **Your Role:** As you build the foundational tools, think about what data points can be used to power this layer. The logic for these nudges will be implemented as a separate effort but relies on the data captured by the core tools.

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

**Paywall Gate Example (in a new component):**
```typescript
// Example of Paywall Gate for Quote Generator
const handleGenerateQuote = () => {
  if (!isPro && quoteCount >= 3) {
    onShowPaywall();
  } else {
    // Proceed with quote generation
  }
};
```

---

## 🤝 Handoff Instruction
When picking up a task:
1.  **Review the "Contractor Core Loop"** in `docs/DEVELOPMENT_ROADMAP.md`.
2.  **Respect the Swiss Style.** Do not add rounded buttons or soft shadows.
3.  **Test Paywalls.** Every new feature must have a clear Pro-tier hook.
4.  **Build for the Client.** Remember, there is no backend database. All logic must be client-side.

**"Solvency is not a metric. It is a survival skill."**
