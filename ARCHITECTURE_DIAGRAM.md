# Numera Tools Architecture

## Component Hierarchy

```
App.tsx (Main Application)
│
├── Header & Branding
├── Financial Input Components
│   ├── FinancialInput (AR/AP)
│   └── BankInput (Banks/Credit Cards)
│
├── Action Buttons Bar
│   ├── [History] button
│   ├── [Recurring] button
│   ├── [Tools ▼] button ← NEW!
│   │   └── ToolsMenu.tsx
│   │       ├── 📝 To-Do List → TodoList.tsx
│   │       ├── 💵 Pricing Sheet → PricingSheet.tsx (NEW)
│   │       ├── 📊 Hourly Rate → HourlyRateCalculator.tsx (NEW)
│   │       └── 📈 Cash Forecast → CashFlowForecast.tsx (NEW)
│   ├── [Log Balance] button
│   └── [Upgrade] button
│
├── Results Display
│   ├── BNE Calculation
│   ├── Charts
│   └── AI Insights
│
└── Modals (Conditional Renders)
    ├── HistoryModal
    ├── RecurringTransactions
    ├── TodoList
    ├── PricingSheet (NEW)
    ├── HourlyRateCalculator (NEW)
    ├── CashFlowForecast (NEW)
    ├── StripePaymentModal
    └── Legal Modals
```

## State Management Flow

```
App.tsx State:
├── showHistory: boolean
├── showRecurring: boolean
├── showTodo: boolean
├── showPricing: boolean ← NEW
├── showHourlyRate: boolean ← NEW
├── showCashForecast: boolean ← NEW
├── showPaywall: boolean
└── isPro: boolean

User Interaction Flow:
1. User clicks [Tools ▼]
2. ToolsMenu dropdown appears
3. User selects a tool
4. onToolSelect callback fires
5. App.tsx sets corresponding show* state to true
6. React renders the modal component
7. User interacts with tool
8. User closes modal (setShow* to false)
```

## Tool Component Structure

### All Tools Follow This Pattern:

```typescript
interface ToolProps {
  onClose: () => void;
  // Tool-specific props...
}

export default function ToolName({ onClose, ... }: ToolProps) {
  return (
    <div className="fixed inset-0 bg-black/60 ...">
      {/* Modal overlay */}
      <div className="bg-white rounded-lg ...">
        {/* Gradient header with icon */}
        <div className="bg-gradient-to-r from-X to-Y ...">
          <h2>Tool Name</h2>
          <button onClick={onClose}>✕</button>
        </div>
        
        {/* Tool content */}
        <div className="p-6 ...">
          {/* Inputs, calculations, displays */}
        </div>
        
        {/* Footer with actions */}
        <div className="border-t-4 ...">
          <button>Primary Action</button>
        </div>
      </div>
    </div>
  );
}
```

## Data Flow

### Pricing Sheet:
```
User Input → Line Items Array → Calculation → Display → Export
[No external data needed]
```

### Hourly Rate Calculator:
```
User Goals Input → Formula Calculation → Breakdown Display
├── Income Goal
├── Billable Hours
├── Overhead
├── Profit Margin
└── Tax Rate
     ↓
  Hourly Rate
```

### Cash Flow Forecast:
```
App.tsx (result.bne) → CashFlowForecast
User Input (monthly avg) → Daily calculations
Expected Payments → One-off adjustments
     ↓
  Forecast Array → Chart Display
     ↓
  Warnings (if balance low)
```

## Freemium Integration Points

```
CashFlowForecast Component:
├── canUseFeature(days) function
│   ├── 30 days: Always true
│   └── 60/90 days: Check isPro
│
├── Expected Payments limit
│   ├── Free: 3 max → triggers onUpgradeClick
│   └── Pro: Unlimited
│
└── onUpgradeClick callback
    └── Opens StripePaymentModal in App.tsx
```

## File System Layout

```
Numera2/
├── components/
│   ├── ToolsMenu.tsx              # 2.7 KB
│   ├── PricingSheet.tsx           # 8.2 KB
│   ├── HourlyRateCalculator.tsx   # 10.6 KB
│   ├── CashFlowForecast.tsx       # 12.0 KB
│   ├── TodoList.tsx               # Existing
│   ├── FinancialInput.tsx         # Existing
│   ├── BankInput.tsx              # Existing
│   └── RecurringTransactions.tsx  # Existing
│
├── App.tsx                         # Main app (modified)
├── types.ts                        # Type definitions
├── config.ts                       # App configuration
│
├── services/
│   ├── geminiService.ts           # AI insights
│   ├── databaseService.ts         # LocalStorage
│   ├── paymentService.ts          # Stripe
│   └── recurringService.ts        # Recurring logic
│
└── [Documentation]
    ├── COMPLETE_STATUS_REPORT.md
    ├── TOOLS_IMPLEMENTATION_SUMMARY.md
    ├── DEPLOY_NOW.md
    └── VS_CODE_COPILOT_HANDOFF.md
```

## Integration Patterns

### Adding a New Tool:

1. **Create Component** (`components/NewTool.tsx`):
```typescript
export default function NewTool({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 ...">
      {/* Tool UI */}
    </div>
  );
}
```

2. **Add State** (in `App.tsx`):
```typescript
const [showNewTool, setShowNewTool] = useState(false);
```

3. **Register in Menu** (in `components/ToolsMenu.tsx`):
```typescript
const tools = [
  // ... existing tools
  { id: 'newtool', icon: Icon, label: 'New Tool', color: 'bg-color' },
];
```

4. **Add Handler** (in `App.tsx`):
```typescript
<ToolsMenu 
  onToolSelect={(tool) => {
    // ... existing tools
    else if (tool === 'newtool') setShowNewTool(true);
  }}
/>
```

5. **Add Modal Render** (in `App.tsx`):
```typescript
{showNewTool && (
  <NewTool onClose={() => setShowNewTool(false)} />
)}
```

## Styling System

### Design Tokens:
```css
/* Neo-Brutalist Style */
--border: 4px solid black
--shadow: 8px 8px 0px 0px rgba(0,0,0,1)
--radius: rounded-lg (0.5rem)

/* Tool-Specific Gradients */
Todo:       bg-gradient-to-r from-green-600 to-teal-600
Pricing:    bg-gradient-to-r from-purple-600 to-pink-600
Hourly:     bg-gradient-to-r from-green-600 to-teal-600
Forecast:   bg-gradient-to-r from-blue-600 to-purple-600
Menu:       bg-gradient-to-r from-purple-600 to-pink-600
```

### Responsive Breakpoints:
```
sm: 640px   (Mobile landscape)
md: 768px   (Tablet)
lg: 1024px  (Desktop)
xl: 1280px  (Large desktop)
```

## Performance Considerations

### Bundle Impact:
- **ToolsMenu**: +2.7 KB
- **PricingSheet**: +8.2 KB
- **HourlyRateCalculator**: +10.6 KB
- **CashFlowForecast**: +12.0 KB (includes Recharts for charts)
- **Total Addition**: ~33.5 KB (uncompressed)

### Lazy Loading (Future):
```typescript
// Could implement code splitting:
const PricingSheet = lazy(() => import('./components/PricingSheet'));
const HourlyRateCalculator = lazy(() => import('./components/HourlyRateCalculator'));
const CashFlowForecast = lazy(() => import('./components/CashFlowForecast'));
```

### Optimization Opportunities:
1. Lazy load tool components (only load when opened)
2. Share Recharts instance between components
3. Memoize expensive calculations
4. Virtualize long lists in tools

## Security Model

### Client-Side Only:
```
User Device
├── LocalStorage (encrypted by browser)
│   ├── Financial data
│   ├── Tool preferences
│   └── User settings
│
└── Memory (temporary)
    ├── Tool calculations
    ├── Chart data
    └── Form state

❌ No data sent to servers
❌ No telemetry
✅ Privacy by design
```

## Future Enhancements

### Potential Tool Additions:
1. **Invoice Generator** (builds on Pricing Sheet)
2. **Expense Categorizer** (with AI)
3. **Tax Calculator** (quarterly estimates)
4. **Profit/Loss Generator** (from AR/AP)
5. **Budget Planner** (enhanced version)
6. **Break-Even Calculator**
7. **ROI Calculator**
8. **Scenario Planner** (enhanced What-If)

### Shared Tool Infrastructure:
```
components/tools/
├── shared/
│   ├── ToolModal.tsx       # Base modal component
│   ├── ToolHeader.tsx      # Reusable header
│   └── ToolFooter.tsx      # Reusable footer
├── calculations/
│   ├── PricingSheet.tsx
│   ├── HourlyRate.tsx
│   └── CashFlow.tsx
└── generators/
    ├── Invoice.tsx
    └── Report.tsx
```

---

**Architecture Status**: ✅ Stable, Scalable, Maintainable
**Last Updated**: December 18, 2025
