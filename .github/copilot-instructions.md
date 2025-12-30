# Copilot Instructions for Numera2

## Project Overview
Numera2 is a modular TypeScript/React app for financial planning and business tools. It emphasizes clear separation of UI (in `components/`) and business logic (in `services/`), with extensibility and maintainability as core goals.

## Architecture & Patterns
- **UI Components:**
  - All UI logic is in `components/`. Each file is a focused, reusable React component (e.g., [BudgetPlanner.tsx](../components/BudgetPlanner.tsx), [PricingCalculator.tsx](../components/PricingCalculator.tsx)).
  - Components are stateless where possible; state is managed at the app or service level.
  - New tools/calculators should be added as new components and registered in [ToolsMenu.tsx](../components/ToolsMenu.tsx).
- **Service Layer:**
  - Business logic and integrations are in `services/` (e.g., [databaseService.ts](../services/databaseService.ts), [geminiService.ts](../services/geminiService.ts), [paymentService.ts](../services/paymentService.ts)).
  - Services are imported into components as needed, not globally.
- **Data Flow:**
  - Data flows from parent to child via props. Services handle async data and return results to components.
  - No global state management library; use React state/hooks and service calls.
- **Type Safety:**
  - Shared types are in [types.ts](../types.ts). Always import from here for cross-component/service types.
- **Configuration:**
  - App-wide config: [config.ts](../config.ts), [capacitor.config.ts](../capacitor.config.ts).
  - API keys/secrets: `.env.local` (not committed).

## Developer Workflows
- **Install & Run:**
  - `npm install` to install dependencies
  - `npm run dev` to start the app locally
  - Requires Node.js and a valid `GEMINI_API_KEY` in `.env.local`
- **Build:**
  - `npm run build` for production build
- **Debugging:**
  - Use browser dev tools; React errors are caught by [ErrorBoundary.tsx](../components/ErrorBoundary.tsx).
- **Testing:**
  - No formal test suite; add tests in a `__tests__/` directory if needed.

## Integration & Conventions
- **External APIs:**
  - Gemini API: [geminiService.ts](../services/geminiService.ts) (API key via `.env.local`)
  - Stripe: [StripePaymentModal.tsx](../components/StripePaymentModal.tsx), [paymentService.ts](../services/paymentService.ts)
- **Error Handling:**
  - Use [ErrorBoundary.tsx](../components/ErrorBoundary.tsx) for React error boundaries. Services should throw errors for components to catch.
- **Extending Functionality:**
  - Add new tools as components in `components/` and register in [ToolsMenu.tsx](../components/ToolsMenu.tsx).

## Examples
- To add a new calculator: create `components/NewCalculator.tsx`, implement logic, and register in [ToolsMenu.tsx](../components/ToolsMenu.tsx).
- To use Gemini API: call methods from [geminiService.ts](../services/geminiService.ts); set API key in `.env.local`.

## References
- [README.md](../README.md) for setup/run instructions
- [components/](../components/) for UI patterns
- [services/](../services/) for business logic/integrations
- [types.ts](../types.ts) for shared types

---
If any conventions or workflows are unclear or missing, please provide feedback or propose updates to this file.
