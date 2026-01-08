# Gemini Prompts for Solventless Feature Development

## 🎯 How to Use These Prompts

1. Copy the prompt for the feature you want to build
2. Paste into Google AI Studio (https://aistudio.google.com/)
3. Review the generated code/design
4. Iterate by asking follow-up questions
5. Implement in your codebase

---

## 🔁 PROMPT 1: Recurring Transactions Feature

```
I'm building a React + TypeScript financial tracking app called Solventless. I need to add a RECURRING TRANSACTIONS feature.

CONTEXT:
- Users manually enter income/expenses currently
- Want to automate recurring items (rent, subscriptions, invoices)
- Need both auto-add and manual confirmation options

CURRENT TECH STACK:
- React 19 with TypeScript
- LocalStorage for all data persistence
- Decimal.js for precise financial calculations
- Lucide-react for icons
- Tailwind CSS for styling
- No backend/database (pure client-side)

CURRENT DATA MODEL:
```typescript
interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date_occurred: string; // ISO date string
}
```

REQUIREMENTS:
1. Create RecurringTransaction type/interface
2. Store in localStorage alongside regular transactions
3. Support frequencies: daily, weekly, bi-weekly, monthly, quarterly, annually
4. User can choose "auto-add" or "notify me first"
5. Show "next occurrence" date for each recurring item
6. Ability to pause/resume/edit/delete recurring items
7. When occurrence date arrives, either auto-add or show notification

PLEASE PROVIDE:
1. Full TypeScript type definitions for RecurringTransaction
2. localStorage schema/structure
3. Component architecture (which components to create)
4. Logic for calculating next occurrence date
5. Logic for checking if recurring items need to be added today
6. Sample React component code for:
   - RecurringTransactionForm (create/edit)
   - RecurringTransactionList (display all recurring items)
7. Function to process pending recurring transactions on app load

FREEMIUM CONSTRAINT:
- Free users: Max 3 recurring items
- Pro users: Unlimited

Please provide clean, production-ready code that matches modern React best practices.
```

---

## 🔮 PROMPT 2: Cash Flow Forecast (30-Day)

```
I'm adding a 30-DAY CASH FLOW FORECAST feature to my React financial app.

CONTEXT:
- Users currently see their current BNE (Business Net Exact) calculation
- Want to show projected cash position for next 30 days
- Should warn users if balance goes negative

CURRENT DATA:
```typescript
interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date_occurred: string;
}

interface BankAccount {
  id: string;
  name: string;
  amount: number;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT';
}

interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  startDate: string;
  nextOccurrence: string;
}

// Current totals
const currentCashBalance = 28000; // Sum of bank accounts
const currentCreditDebt = 1850;
const netCash = currentCashBalance - currentCreditDebt; // $26,150
```

REQUIREMENTS:
1. Calculate projected balance for each of next 30 days
2. Factor in scheduled/recurring income and expenses
3. Start with current net cash position
4. Visual chart showing:
   - Green bars for days with income
   - Red bars for days with expenses
   - Line graph showing running balance
5. Highlight days where balance goes negative (cash crunch warning)
6. Allow user to see details for any day (what's happening that day)

CHART LIBRARY:
We're using recharts (already installed)

PLEASE PROVIDE:
1. TypeScript interface for forecast data structure
2. Function to generate 30-day forecast from current data
3. Logic to handle recurring transactions in forecast
4. React component code for the forecast visualization
5. Warning/alert component for negative balance days
6. Sample recharts configuration for the timeline chart

FREEMIUM CONSTRAINT:
- Free users: 7-day forecast only
- Pro users: 30-day or 90-day forecast

Make it visually clear and actionable for small business owners.
```

---

## 💰 PROMPT 3: Monthly Budget Tracker

```
I'm building a MONTHLY BUDGET TRACKER for my financial app.

CONTEXT:
- Users enter transactions (income/expenses)
- Want to set monthly spending limits by category
- Track actual spending vs. budget
- Alert when approaching or exceeding budget

CURRENT DATA:
```typescript
interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date_occurred: string;
  category?: string; // NEW: need to add categories
}
```

REQUIREMENTS:
1. Add category field to transactions
2. Create Budget type/interface
3. Support custom budget categories (e.g., "Marketing", "Operations", "Payroll")
4. Set monthly limit for each category
5. Calculate actual spending for current month
6. Visual display:
   - Progress bars showing % of budget used
   - Green (under 70%), Yellow (70-90%), Red (90%+)
7. Show remaining budget amount
8. Month-over-month comparison
9. AI insight: "You're spending 30% more on marketing this month"

TECH STACK:
- React + TypeScript
- LocalStorage persistence
- Decimal.js for calculations

PLEASE PROVIDE:
1. Updated Transaction type with categories
2. Budget type/interface definition
3. Category suggestion list (common business categories)
4. Logic to calculate spending by category for current month
5. Function to determine budget health (green/yellow/red)
6. React component for:
   - BudgetSetup (create/edit budget categories)
   - BudgetTracker (visual display of current status)
7. Logic to handle transactions without categories (assign "Uncategorized")

FREEMIUM CONSTRAINT:
- Free users: 3 budget categories max
- Pro users: Unlimited categories + AI budget insights

Provide clean, maintainable code with good UX.
```

---

## 🎨 PROMPT 4: Visual Design Improvements

```
I want to improve the visual design of my financial app to match professional standards.

CURRENT DESIGN:
- Using Tailwind CSS
- Black/white color scheme
- "Swiss" design aesthetic (clean, bold borders)
- Sans-serif fonts

GOALS:
1. Make it more friendly and approachable (less stark)
2. Better visual hierarchy
3. Smoother animations/transitions
4. Professional color palette for financial data

PLEASE PROVIDE:
1. Refined color palette (primary, secondary, success, warning, error)
2. Typography scale (font sizes for h1, h2, h3, body, small)
3. Spacing system (padding/margin scale)
4. Component styles for:
   - Buttons (primary, secondary, danger)
   - Input fields (default, focus, error states)
   - Cards/panels
   - Modal dialogs
5. Animation recommendations (what should animate, how)
6. Chart color schemes for financial data
7. Dark mode color adjustments (optional)

CONSTRAINTS:
- Must work with Tailwind CSS
- Keep it professional for business users
- Maintain accessibility (WCAG AA)
- Fast loading (no heavy assets)

Provide Tailwind config updates and component examples.
```

---

## 🔔 PROMPT 5: Smart Notifications System

```
I need to add a SMART NOTIFICATIONS system to my financial app.

CONTEXT:
- Pure client-side app (no backend)
- Users want alerts for important financial events

NOTIFICATION TYPES NEEDED:
1. Low balance alert (bank account below threshold)
2. Overdue payment reminder (AR not collected)
3. Upcoming expense reminder (AP due soon)
4. Budget exceeded warning (over spending limit)
5. Recurring transaction confirmation (if not auto-add)

TECH CONSTRAINTS:
- No backend/server
- Can't send emails or SMS
- Must work offline
- LocalStorage only

REQUIREMENTS:
1. In-app notification system (toast/banner)
2. Notification center (list of all notifications)
3. User preferences (which alerts to enable, thresholds)
4. Persistent notifications (don't disappear until dismissed)
5. Check for triggers on app load and periodically
6. Mark notifications as read/dismissed

PLEASE PROVIDE:
1. Notification type/interface definition
2. NotificationService logic (check triggers, create notifications)
3. LocalStorage schema for notifications
4. React components:
   - NotificationBanner (toast popup)
   - NotificationCenter (list view)
   - NotificationSettings (user preferences)
5. Logic to check for notification triggers
6. Sample triggers for each notification type

Make notifications helpful, not annoying. Actionable and clear.
```

---

## 📊 PROMPT 6: Financial Health Score

```
Create a FINANCIAL HEALTH SCORE (0-100) for my business finance app.

CONTEXT:
- Small business owners want one simple number to track
- Should consider multiple factors
- Easy to understand, hard to game

AVAILABLE DATA:
- Current cash balance
- Credit card debt
- Accounts receivable (money owed to you)
- Accounts payable (money you owe)
- Monthly income/expense history
- Recurring transactions

SCORE FACTORS (suggested):
1. Current Ratio (assets/liabilities) - 25%
2. Cash Runway (months until $0) - 25%
3. Days Sales Outstanding (how fast you collect) - 15%
4. Debt-to-Equity ratio - 15%
5. Profit margin trend - 10%
6. Budget adherence - 10%

REQUIREMENTS:
1. Calculate overall score (0-100)
2. Show score with visual gauge/meter
3. Break down contributing factors
4. Historical chart (score over time)
5. Actionable recommendations to improve score
6. Color coding: Red (<60), Yellow (60-79), Green (80+)

PLEASE PROVIDE:
1. Scoring algorithm with TypeScript implementation
2. Breakdown component showing each factor's contribution
3. Logic to generate improvement suggestions
4. Chart configuration for historical tracking
5. Sample calculation with example data

Keep it simple enough for non-financial people to understand.
```

---

## 🚀 How to Iterate with Gemini

After getting initial code:

**Follow-up prompts:**
- "Make the UI more mobile-friendly"
- "Add error handling for edge cases"
- "Simplify the logic, make it more readable"
- "Add unit test examples for this function"
- "Make this component more performant"
- "Add TypeScript strict mode compliance"

**For design:**
- "Show me 3 color palette alternatives"
- "Make this chart more visually appealing"
- "Add micro-interactions to this button"

---

## 📝 Implementation Checklist

For each feature:
- [ ] Get TypeScript types from Gemini
- [ ] Review and refine the code
- [ ] Create component files in your codebase
- [ ] Test with sample data
- [ ] Add freemium restrictions
- [ ] Update localStorage schema
- [ ] Test persistence (refresh page)
- [ ] Add to main app navigation
- [ ] Test on mobile
- [ ] Deploy and monitor usage

---

## 💡 Pro Tips

1. **Start with types** - Get the data model right first
2. **Build in isolation** - Test component separately before integrating
3. **Use Gemini iteratively** - Don't accept first answer, refine it
4. **Ask for tests** - Request example test cases
5. **Request documentation** - Ask Gemini to add JSDoc comments

Good luck! These prompts should give you everything you need to build these features yourself.

