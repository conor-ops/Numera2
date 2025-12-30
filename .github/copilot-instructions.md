# Copilot Instructions for Numera2

## Project Overview
Numera2 is a TypeScript/React app for financial planning and business tools. It features modular components for calculations, planning, and payment integration, with a focus on extensibility and clear separation of concerns.

## Architecture & Key Patterns
- **Component Structure:**
  - All UI logic is in `components/`. Each file is a focused, reusable React component (e.g., `BudgetPlanner.tsx`, `PricingCalculator.tsx`).
  - Components are stateless where possible; state is managed at the app or service level.
- **Service Layer:**
  - Business logic and external integrations are in `services/` (e.g., `databaseService.ts`, `geminiService.ts`, `paymentService.ts`).
  - Services are imported into components as needed, not globally.
- **Data Flow:**
  - Data flows from parent to child via props. Services handle async data and return results to components.
  - No global state management library; use React state/hooks and service calls.
- **Configuration:**
  - App-wide config is in `config.ts` and `capacitor.config.ts`.
  - API keys and secrets are set in `.env.local` (not committed).

## Developer Workflows
- **Install & Run:**
  - `npm install` to install dependencies
  - `npm run dev` to start the app locally
  - Requires Node.js and a valid `GEMINI_API_KEY` in `.env.local`
- **Build:**
  - `npm run build` for production build
- **Debugging:**
  - Use browser dev tools; errors are caught by `ErrorBoundary.tsx`.
- **Testing:**
  - No formal test suite detected; add tests in a `__tests__/` directory if needed.

## Conventions & Integration
- **Type Safety:**
  - Shared types are in `types.ts`. Always import from here for cross-component/service types.
- **External APIs:**
  - Gemini API integration via `geminiService.ts` (requires API key)
  - Stripe handled in `StripePaymentModal.tsx` and `paymentService.ts`
- **Error Handling:**
  - Use `ErrorBoundary.tsx` for React error boundaries. Services should throw errors for components to catch.
- **Extending Functionality:**
  - Add new tools as components in `components/` and expose them via `ToolsMenu.tsx`.

## Examples
- To add a new calculator, create `components/NewCalculator.tsx`, add logic, and register it in `ToolsMenu.tsx`.
- To use Gemini API, call methods from `services/geminiService.ts` and handle API keys via `.env.local`.

## References
- [README.md](../README.md) for setup and run instructions
- [components/](../components/) for UI patterns
- [services/](../services/) for business logic and integrations
- [types.ts](../types.ts) for shared types

---
If any conventions or workflows are unclear, please ask for clarification or propose updates to this file.
