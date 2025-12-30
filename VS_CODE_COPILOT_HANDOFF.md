# VS Code Copilot - Numera2 Project Coordination

**Date:** December 18, 2025  
**Project:** Numera2 - Financial Clarity Platform  
**Workspace:** `C:\Users\conor\Documents\GitHub\Numera2\Numera2.code-workspace`

---

## 🎯 Mission Overview

You are working in coordination with GitHub Copilot CLI on the Numera2 project. This is a React + TypeScript financial management app for freelancers and contractors, with AI-powered insights using Google Gemini, deployed on Firebase.

**Current Status:**
- ✅ Live deployment at: https://numera-481417.web.app/
- ✅ Core features working: BNE calculator, AR/AP tracking, recurring transactions
- ✅ Freemium model with Stripe paywall ($10/year Pro tier)
- ✅ Modern UI with gradient design (teal/purple theme)
- 🚧 **IN PROGRESS:** Building Tools section with contractor-focused features

---

## 🔧 Your Current Focus

### Primary Task: Tools Section Development

Build out the **Tools** section with the following features:

1. **Todo List** (Already exists - needs to be moved into Tools)
2. **Pricing Sheet Generator** ⭐ NEW
3. **Hourly Rate Calculator** ⭐ NEW
4. **Cash Flow Forecast (30/60/90 day)** ⭐ NEW
5. **Project Profitability Calculator** ⭐ NEW

### Implementation Requirements

**UI/UX Standards:**
- Use existing gradient design system (teal to purple)
- Match the modern, clean aesthetic of current app
- Ensure mobile-responsive design
- Use Lucide React icons consistently
- Follow Tailwind CSS conventions already in use

**Technical Constraints:**
- **Local-first architecture:** All data in LocalStorage (no backend database)
- **Minimum liability:** Client-side only calculations and data processing
- **AI integration:** Use existing Gemini API service for smart features
- **Freemium limits:** Free users have feature restrictions, Pro users get full access

---

## 📁 Project Structure

```
Numera2/
├── src/
│   ├── App.tsx                    # Main app component
│   ├── components/
│   │   ├── Dashboard.tsx          # Main dashboard
│   │   ├── TodoModal.tsx          # Todo feature (move to Tools)
│   │   ├── RecurringTransactions.tsx
│   │   └── [NEW] Tools/           # Create this directory
│   │       ├── ToolsMenu.tsx      # Tools section main menu
│   │       ├── TodoTool.tsx       # Refactored todo
│   │       ├── PricingSheet.tsx   # NEW
│   │       ├── HourlyRateCalc.tsx # NEW
│   │       ├── CashFlowForecast.tsx # NEW
│   │       └── ProfitCalc.tsx     # NEW
│   ├── services/
│   │   ├── aiService.ts           # Gemini API integration
│   │   └── stripeService.ts       # Payment handling
│   ├── utils/
│   │   └── storage.ts             # LocalStorage helpers
│   └── types.ts                   # TypeScript types
├── firebase.json                  # Firebase hosting config
├── vite.config.ts                 # Build configuration
└── package.json                   # Dependencies
```

---

## 🚀 Feature Specifications

### 1. Tools Menu (ToolsMenu.tsx)

Replace the single "Todo" button with a "Tools" dropdown/modal that shows:

```typescript
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isPro: boolean; // Free vs Pro feature
}

const tools: Tool[] = [
  { id: 'todo', name: 'Todo List', description: 'Manage tasks', icon: ListTodo, isPro: false },
  { id: 'pricing', name: 'Pricing Sheet', description: 'Create project quotes', icon: DollarSign, isPro: false },
  { id: 'hourly', name: 'Hourly Rate', description: 'Calculate your ideal rate', icon: Calculator, isPro: false },
  { id: 'forecast', name: 'Cash Flow Forecast', description: '30/60/90 day projections', icon: TrendingUp, isPro: true },
  { id: 'profit', name: 'Project Profit', description: 'Analyze project margins', icon: PieChart, isPro: true }
];
```

**UI Pattern:**
- Button in header/nav labeled "Tools 🛠️"
- Clicking opens a modal/dropdown with grid of tool cards
- Each card shows icon, name, description, and "Pro" badge if applicable
- Free users can access free tools, see Pro tools with upgrade prompt

---

### 2. Pricing Sheet Generator (PricingSheet.tsx)

**Purpose:** Help contractors create professional quotes/estimates quickly.

**Features:**
- Add line items (description, quantity, unit price)
- Auto-calculate subtotal, tax (optional %), total
- Save templates for common services
- Export to PDF or copy to clipboard

**Data Structure:**
```typescript
interface PricingLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PricingSheet {
  id: string;
  clientName: string;
  projectName: string;
  date: string;
  lineItems: PricingLineItem[];
  taxRate: number; // percentage
  subtotal: number;
  tax: number;
  total: number;
}
```

**Freemium:**
- Free: Create 1 active pricing sheet, basic export
- Pro: Unlimited sheets, save templates, custom branding

---

### 3. Hourly Rate Calculator (HourlyRateCalc.tsx)

**Purpose:** Help freelancers calculate what to charge based on their desired income and actual working hours.

**Inputs:**
- Desired annual income
- Estimated billable hours per year
- Annual expenses (overhead)
- Desired profit margin (%)

**Calculation:**
```
Target Hourly Rate = (Desired Income + Expenses + Profit) / Billable Hours
```

**Output:**
- Recommended hourly rate
- Breakdown showing how it's calculated
- Comparison with common industry rates (optional AI insight)

**Freemium:**
- Free: Basic calculation
- Pro: Save multiple scenarios, AI-powered market rate suggestions

---

### 4. Cash Flow Forecast (CashFlowForecast.tsx) 🔒 PRO

**Purpose:** Project future cash position based on existing AR, AP, and recurring transactions.

**How it works:**
1. Start with current BNE (Bank Net Equity)
2. Add scheduled receivables (AR with due dates)
3. Subtract scheduled payables (AP with due dates)
4. Apply recurring transactions over forecast window
5. Show daily/weekly projected balance

**Visualization:**
- Line chart showing projected BNE over 30/60/90 days
- Highlight cash crunches (when balance goes low/negative)
- Mark key dates (large payments in/out)

**Data Sources:**
- Current BNE from LocalStorage
- AR items with due dates
- AP items with due dates
- Recurring transactions

**Freemium:**
- Free: Locked with upgrade prompt
- Pro: Full 30/60/90 day forecast with "what-if" scenarios

---

### 5. Project Profitability Calculator (ProfitCalc.tsx) 🔒 PRO

**Purpose:** Analyze whether a project is profitable before or after completion.

**Inputs:**
- Project revenue (total invoice amount)
- Material costs
- Labor hours × hourly rate
- Other expenses (subcontractors, permits, etc.)

**Calculation:**
```
Gross Profit = Revenue - (Materials + Labor + Other Expenses)
Profit Margin % = (Gross Profit / Revenue) × 100
```

**Output:**
- Gross profit amount
- Profit margin percentage
- Color-coded indicator (red = loss, yellow = break-even, green = profit)
- Recommendations to improve margin

**Freemium:**
- Free: Locked with upgrade prompt
- Pro: Unlimited project calculations, save and compare projects

---

## 🎨 Design System Reference

**Colors:**
```css
/* Gradient theme */
background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #312E81 100%);

/* Primary colors */
--teal: #14B8A6;
--purple: #A855F7;
--blue: #3B82F6;

/* Semantic colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

**Typography:**
- Font family: Inter (sans-serif), Roboto Mono (monospace for numbers)
- Headings: Bold (600-800)
- Body: Regular (400)

**Component Patterns:**
- Use `backdrop-blur-sm` for glassmorphism effects
- Cards: `bg-white/10 backdrop-blur-sm rounded-xl border border-white/20`
- Buttons: Gradient backgrounds with hover effects
- Icons: Lucide React, size 20-24px typically

---

## 🔐 Security & Data Handling

**CRITICAL RULES:**

1. **No Backend Writes:** All data stays in LocalStorage
2. **No Secrets in Code:** Use environment variables for API keys via `.env.local`; ensure `.env.local` is added to `.gitignore` and never committed
3. **CSP Compliance:** All external resources must be allowed in `firebase.json`
4. **Gemini API:** Use existing `services/aiService.ts`; the Gemini API key must be loaded from environment variables (configured in `.env.local`) and must never be hardcoded or committed

**LocalStorage Keys Pattern:**
```typescript
'numera_bneTotals'
'numera_accountsReceivable'
'numera_accountsPayable'
'numera_creditCards'
'numera_recurringTransactions'
'numera_isPro' // User subscription status
'numera_tools_[toolName]' // Tool-specific data
```

---

## 🧪 Testing Requirements

Before deploying:
1. ✅ Test on mobile viewport (responsive)
2. ✅ Test freemium locks (free vs Pro features)
3. ✅ Verify LocalStorage persistence (refresh page, data stays)
4. ✅ Test with cleared cache (new user experience)
5. ✅ Console errors: None allowed in production

---

## 🚢 Deployment Process

**DO NOT deploy yourself.** The CLI Copilot handles Firebase deployments.

When ready for deployment, notify the user:
> "Tools section complete and tested. Ready for deployment to Firebase. All changes committed to Git."

**Your role:**
1. Build features in `src/components/Tools/`
2. Update imports in `App.tsx` or `Dashboard.tsx`
3. Test locally with `npm run dev`
4. Commit to Git with clear messages
5. Report completion

---

## 📊 Current App State (What's Already Working)

✅ **Core Features:**
- BNE Calculator (Bank Net Equity: Cash + AR - AP - CC)
- Accounts Receivable tracking
- Accounts Payable tracking
- Credit Card tracking
- Recurring Transactions (auto-add to AP/AR)
- AI-powered financial insights (Gemini)

✅ **Freemium System:**
- 1 Credit Card limit for free users
- Pro users ($10/year via Stripe) get unlimited features
- PaywallModal component handles upgrade flow

✅ **UI/UX:**
- Modern gradient design (dark theme with teal/purple accents)
- Responsive mobile-first layout
- Glassmorphism effects
- Smooth animations

---

## 🤝 Coordination Protocol

**With CLI Copilot:**
- CLI handles: Firebase deployment, environment setup, npm scripts
- You handle: Component development, UI implementation, local testing

**With User (Conor):**
- Always ask for clarification on ambiguous requirements
- Report progress at logical checkpoints
- Flag any blockers immediately

**Version Control:**
- Commit frequently with descriptive messages
- Don't break existing features
- Test before committing

---

## 📝 Code Style Guidelines

**TypeScript:**
```typescript
// Use explicit types
interface Props {
  userId: string;
  onClose: () => void;
}

// Prefer function components
export default function ToolsMenu({ userId, onClose }: Props) {
  // Component logic
}
```

**React Patterns:**
- Use hooks (useState, useEffect, useCallback)
- Avoid prop drilling (consider Context if needed)
- Memoize expensive calculations
- Handle loading and error states

**Tailwind CSS:**
- Use utility classes, avoid custom CSS
- Responsive: `sm:`, `md:`, `lg:` breakpoints
- Dark mode: Already handled by gradient theme

---

## 🎯 Success Criteria

**Definition of Done:**

For each tool:
- [ ] Component created in `src/components/Tools/`
- [ ] TypeScript interfaces defined
- [ ] LocalStorage persistence working
- [ ] Freemium restrictions enforced
- [ ] Mobile responsive
- [ ] Matches design system
- [ ] No console errors
- [ ] Tested in browser
- [ ] Git committed

For Tools Section overall:
- [ ] ToolsMenu.tsx renders all tools
- [ ] Navigation works from main app
- [ ] Free users see upgrade prompts on Pro features
- [ ] Pro users access all features
- [ ] Data persists across sessions
- [ ] No styling regressions

---

## 🚨 Known Issues to Avoid

1. **CSP Violations:** Don't add external scripts/styles without updating `firebase.json`
2. **LocalStorage Limits:** Keep data structures lean (5MB browser limit)
3. **API Key Exposure:** Never commit `.env.local` or hardcode keys
4. **Styling Conflicts:** Don't use inline styles, stick to Tailwind
5. **Breaking Changes:** Test that existing features (BNE, AR, AP) still work

---

## 📞 Questions?

If you encounter:
- **Unclear requirements** → Ask the user for clarification
- **Technical blockers** → Check existing code patterns first, then ask
- **Design decisions** → Match existing aesthetic, or present options
- **Breaking changes** → Stop and report before proceeding

---

## 🎉 Let's Build!

You have everything you need to create an amazing Tools section. Focus on:
1. **User experience** - Make it intuitive and delightful
2. **Code quality** - Clean, typed, tested
3. **Performance** - Fast and responsive
4. **Consistency** - Match existing patterns

**First Task:** Create `src/components/Tools/ToolsMenu.tsx` and integrate it into the app. Start with the menu structure, then we'll build each tool one by one.

Good luck! 🚀
