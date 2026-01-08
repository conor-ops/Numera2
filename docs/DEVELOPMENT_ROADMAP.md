# Development Roadmap: Precision Finance Iteration

## 1. Current State Analysis

### Visual Identity & UI/UX
*   **Design System:** The project uses a "Swiss Style" design system defined in `tailwind.config.js` and `index.css`.
    *   **Palette:** Monochrome-heavy (Brand Black, White) with functional colors (Brand Blue, Gray) and semantic colors (Green/Red/Amber for status).
    *   **Typography:** 'Inter' for UI, 'Roboto Mono' for data.
    *   **Styling:** Heavy use of `border-2 border-black`, `shadow-swiss` (hard shadows), and high-contrast elements.
    *   **Assessment:** The aesthetic is consistent and aligns with a "utilitarian/precision" vibe. No immediate legacy conflicts found, but `App.tsx` inline styles/classes should be monitored for consistency.

### Core Features
*   **Business Net Equity (BNE):** Fully implemented in `App.tsx`. Live calculation of (Receivables - Payables) + (Bank - Credit).
*   **Data Visualization:** `recharts` is integrated. `CashFlowRiver` exists for visualization.
*   **Heads-Up Display (HUD):** Implemented in the `App.tsx` header ("Safe Draw", "Health Pulse", "Sandbox Mode").
*   **Inputs:** `FinancialInput` and `BankInput` components handle core data entry.
*   **Persistence:** `databaseService.ts` correctly implements the Local-First architecture (SQLite for native, localStorage for web).

### AI & CFO Capabilities
*   **Integration:** `geminiService.ts` handles communication with Google's Gemini models.
*   **Features:**
    *   `generateFinancialInsight`: Basic summarization.
    *   `scoreOpportunity`: Structured analysis of potential deals (Risk/Pros/Cons).
    *   `performInvoiceAudit`: Proactive auditing of documents.
*   **Status:** Functional, but the "Proactive CFO" personality could be deepened.

## 2. Gap Analysis (Precision Finance Vision)

The following features from the "Precision Finance" vision are **missing** or incomplete:

*   **Scope Guard Calculator:** No component or logic found for calculating scope creep or project variances.
*   **Lifestyle Parity Calculator:** No logic found for equating business profit to personal lifestyle costs.
*   **Proactive Strategy:** While `scoreOpportunity` is good, the main dashboard AI insight is reactive ("Insight for BNE..."). It lacks a "Daily Briefing" or proactive "Warning" system based on trends.

## 3. Technical Debt & Architecture

*   **Monolithic `App.tsx`:** The main component contains all business logic (`calculations` memo), state management, and UI layout. This makes it hard to maintain and test.
*   **Action:** Logic should be extracted into custom hooks (e.g., `useBusinessMath`, `useFinancialData`).
*   **Type Safety:** `types.ts` is used, but some `any` types were observed in service responses (`geminiService.ts` history).

## 4. Prioritized Development Tasks

### High Priority: New Features
*   **Task:** Implement the 'Scope Guard' pricing calculator as a new component in `src/components/tools/` and integrate it into the `BusinessTools` menu.
    *   *Goal:* Allow users to input original scope vs. actual requests and calculate the profitability impact.
*   **Task:** Implement the 'Lifestyle Parity' calculator.
    *   *Goal:* A tool to reverse-calculate required BNE based on desired personal monthly take-home pay.

### Medium Priority: Refactoring
*   **Task:** Refactor `App.tsx` to extract financial calculations into a `useBusinessCalculations` hook.
    *   *Goal:* Simplify the view layer and enable unit testing of the math logic.
*   **Task:** Refactor `App.tsx` to extract data persistence logic into a `useBusinessData` hook.

### Low Priority: AI Enhancements
*   **Task:** Refactor the AI prompt in `geminiService.ts` (`generateFinancialInsight`) to request proactive financial strategies (e.g., "Suggest 3 actions to improve liquidity") instead of a simple summary.