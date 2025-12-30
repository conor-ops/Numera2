# Contractor Tools Suite: Complete Specification
**Date:** December 18, 2025  
**Status:** Ready for Development  
**Priority:** HIGH - Key differentiation for Q1 2026

---

## 🎯 Strategic Overview

### Why Contractor Tools?
- **Target Market:** 40-50% of Numera users are likely contractors/service providers
- **Daily Use:** These tools create daily habits vs. monthly financial reviews
- **Competitive Gap:** QuickBooks/Wave focus on bookkeeping, not bidding/pricing
- **Low Liability:** All client-side calculations, no financial advice
- **Strong Freemium:** Clear free limits drive Pro upgrades

### Value Proposition
*"Numera: The only financial app that helps you PRICE your work right, BID competitively, and TRACK profitability—all while maintaining perfect cash clarity."*

---

## 🛠️ 7 Essential Contractor Tools

### Tool 1: Time & Value Calculator
**Tagline:** "Is this job worth your time?"

**Priority:** ULTRA HIGH (Ship Day 1)  
**Complexity:** Very Low  
**Dev Time:** 1 day

#### Problem
Contractors accept jobs without calculating effective hourly rate, leading to underpaid work.

#### Solution
- Input: Job total price, estimated hours
- Output: Effective hourly rate, daily rate
- Comparison: Shows vs. target rate (from Hourly Rate Calculator)
- Visual: Color-coded (Green/Yellow/Red)

#### UI Flow
```
┌─────────────────────────────────┐
│   Time & Value Calculator        │
├─────────────────────────────────┤
│ Job Price:        [$______]      │
│ Est. Hours:       [____] hours   │
│ Material Costs:   [$______]      │ (optional)
│                                  │
│ [Calculate]                      │
│                                  │
│ Effective Rate: $45/hour 🟢      │
│ Daily Rate: $360/day (8 hrs)     │
│                                  │
│ Your Target: $50/hour            │
│ Difference: -$5/hour (-10%)      │
│                                  │
│ ⚠️ Below target rate!            │
└─────────────────────────────────┘
```

#### Freemium
- **Free:** Single calculation, no save
- **Pro:** Batch compare 5 jobs, save history, auto-pull target rate

#### Tech Stack
- Pure JavaScript math
- LocalStorage for target rate
- Color logic: Green (>=target), Yellow (90-99%), Red (<90%)

---

### Tool 2: Hourly Rate & Salary Calculator
**Tagline:** "Price your time correctly"

**Priority:** ULTRA HIGH (Ship Day 2)  
**Complexity:** Low  
**Dev Time:** 1 day

#### Problem
Freelancers underprice by not accounting for overhead, taxes, non-billable time.

#### Solution
- Input: Desired annual income, billable hours, overhead, tax rate
- Output: Required hourly rate
- Reverse mode: Input rate → See annual income

#### UI Flow
```
┌─────────────────────────────────┐
│  Hourly Rate Calculator          │
├─────────────────────────────────┤
│ Desired Annual Income:           │
│ [$75,000]                        │
│                                  │
│ Billable Hours/Year:             │
│ [1500] (30 hrs/wk × 50 weeks)    │
│                                  │
│ Annual Overhead:                 │
│ [$15,000] (software, insurance)  │
│                                  │
│ Tax Rate:                        │
│ [25]%                            │
│                                  │
│ Desired Profit Margin:           │
│ [10]%                            │
│                                  │
│ [Calculate]                      │
│                                  │
│ Required Hourly Rate: $73/hour   │
│                                  │
│ Breakdown:                       │
│ • Base: $50/hr                   │
│ • Overhead: $10/hr               │
│ • Taxes: $9/hr                   │
│ • Profit: $4/hr                  │
│                                  │
│ [Save as Target Rate]            │
└─────────────────────────────────┘
```

#### Freemium
- **Free:** Basic calc (income + billable hours only)
- **Pro:** Full breakdown with overhead/tax/profit, save scenarios

#### Tech Stack
- Formula: `(Income + Overhead) / (Billable Hours × (1 - Tax Rate)) × (1 + Profit Margin)`
- LocalStorage for saved rates

---

### Tool 3: Project Profitability Calculator
**Tagline:** "Know your profit before you start"

**Priority:** HIGH (Ship Day 3-4)  
**Complexity:** Low-Medium  
**Dev Time:** 1-2 days

#### Problem
Contractors don't know if projects are profitable until after completion.

#### Solution
- Input: Revenue, labor costs, material costs, other expenses
- Output: Gross profit, profit margin %
- Integration: Can pull from existing BNE data

#### UI Flow
```
┌─────────────────────────────────┐
│  Project Profitability           │
├─────────────────────────────────┤
│ Project Name: [Kitchen Remodel]  │
│                                  │
│ REVENUE                          │
│ Total Contract: [$25,000]        │
│                                  │
│ COSTS                            │
│ Labor:          [$8,000]         │
│  └ You: 100hr × $50              │
│  └ Helper: 40hr × $25            │
│                                  │
│ Materials:      [$10,000]        │
│ Equipment:      [$1,500]         │
│ Permits:        [$500]           │
│ Other:          [$500]           │
│                                  │
│ Total Costs:    $20,500          │
│                                  │
│ [Calculate Profit]               │
│                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Gross Profit: $4,500 🟢          │
│ Profit Margin: 18%               │
│                                  │
│ [Save] [Add to AR]               │
└─────────────────────────────────┘
```

#### Freemium
- **Free:** Basic calc (total rev/costs), no save
- **Pro:** Detailed line items, save projects, compare to actuals

#### Tech Stack
- LocalStorage for saved projects
- Optional link to AR (if project accepted)

---

### Tool 4: Service Pricing Sheet Generator
**Tagline:** "Professional pricing in minutes"

**Priority:** MEDIUM (Ship Week 2)  
**Complexity:** Medium  
**Dev Time:** 1-2 weeks

#### Problem
Contractors create messy pricing sheets in Word/Excel, look unprofessional.

#### Solution
- Create service catalog with prices
- Generate clean PDF
- Tiered packages (Basic/Standard/Premium)
- Shareable/downloadable

#### UI Flow
```
┌─────────────────────────────────┐
│  Pricing Sheet Builder           │
├─────────────────────────────────┤
│ Company Info:                    │
│ Name: [ABC Contracting]          │
│ Logo: [Upload]                   │
│                                  │
│ SERVICES                         │
│ 1. Kitchen Remodel               │
│    Starting at $20,000           │
│    [Edit] [Delete]               │
│                                  │
│ 2. Bathroom Remodel              │
│    Starting at $12,000           │
│    [Edit] [Delete]               │
│                                  │
│ [+ Add Service]                  │
│                                  │
│ PACKAGES (Optional)              │
│ ☐ Basic    $___                  │
│ ☐ Standard $___                  │
│ ☐ Premium  $___                  │
│                                  │
│ [Preview PDF] [Download] [Share] │
└─────────────────────────────────┘
```

#### Freemium
- **Free:** Up to 5 services, basic template, PDF download
- **Pro:** Unlimited services, custom branding, multiple sheets, packages

#### Tech Stack
- LocalStorage for service catalog
- jsPDF for generation
- Simple template system (HTML → PDF)

---

### Tool 5: Material Cost Calculator & Tracker
**Tagline:** "Track prices, calculate quantities"

**Priority:** MEDIUM (Ship Week 2-3)  
**Complexity:** Low-Medium  
**Dev Time:** 1-2 weeks

#### Problem
Material prices fluctuate; contractors can't track costs or calculate quantities easily.

#### Solution
- Material database with current costs
- Quantity calculators (e.g., lumber for linear feet)
- Price history tracking
- Supplier comparison

#### UI Flow
```
┌─────────────────────────────────┐
│  Material Cost Calculator        │
├─────────────────────────────────┤
│ [My Materials] [Calculate]       │
│                                  │
│ MY MATERIALS                     │
│ • 2x4 Stud (8ft)    $6.50        │
│   Updated: 12/15/25              │
│   [Edit] [Price History]         │
│                                  │
│ • Drywall 4x8       $12.00       │
│   Updated: 12/10/25              │
│   [Edit] [Price History]         │
│                                  │
│ [+ Add Material]                 │
│                                  │
│ QUANTITY CALCULATOR              │
│ Material: [2x4 Stud]             │
│ Linear Feet: [240] ft            │
│ = 30 studs needed                │
│ = $195.00 total                  │
│                                  │
│ [Add to Project]                 │
└─────────────────────────────────┘
```

#### Freemium
- **Free:** Up to 10 materials, basic calculator
- **Pro:** Unlimited materials, price history, supplier comparison

#### Tech Stack
- LocalStorage for material database
- Built-in formulas for common calculations
- Optional: Simple CSV import/export

---

### Tool 6: Job Cost Estimator
**Tagline:** "Estimate every cost accurately"

**Priority:** MEDIUM-HIGH (Ship Month 2)  
**Complexity:** Medium  
**Dev Time:** 2-3 weeks

#### Problem
Contractors miss costs in estimates (permits, disposal, contingency) leading to losses.

#### Solution
- Comprehensive multi-category estimator
- Materials, labor, equipment, permits, overhead, contingency
- Save templates for job types
- Export to bid

#### UI Flow
```
┌─────────────────────────────────┐
│  Job Cost Estimator              │
├─────────────────────────────────┤
│ Job Name: [Deck Build 24'x12']   │
│                                  │
│ ▼ MATERIALS                      │
│   Pressure Treated 2x6  $1,200   │
│   Deck Screws           $150     │
│   Concrete (bags)       $300     │
│   [+ Add Line]                   │
│   Subtotal: $1,650               │
│                                  │
│ ▼ LABOR                          │
│   Lead (you): 40hr × $50 $2,000  │
│   Helper: 20hr × $25     $500    │
│   [+ Add Line]                   │
│   Subtotal: $2,500               │
│                                  │
│ ▼ EQUIPMENT/TOOLS                │
│   Saw rental (3 days)    $150    │
│   [+ Add Line]                   │
│   Subtotal: $150                 │
│                                  │
│ ▼ PERMITS & FEES                 │
│   Building permit        $250    │
│   [+ Add Line]                   │
│   Subtotal: $250                 │
│                                  │
│ ▼ OVERHEAD (15%)         $682    │
│ ▼ CONTINGENCY (10%)      $523    │
│                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Total Cost: $5,755               │
│                                  │
│ Add Profit Margin: [20]%         │
│ Client Price: $6,906             │
│                                  │
│ [Save Template] [Export to Bid]  │
└─────────────────────────────────┘
```

#### Freemium
- **Free:** Basic single estimate, no save, up to 10 total line items
- **Pro:** Unlimited line items, save estimates, reusable templates, history

#### Tech Stack
- LocalStorage for estimates and templates
- Percentage-based overhead/contingency
- Export to Bid Generator (Tool 7)

---

### Tool 7: Bid/Quote Generator
**Tagline:** "Professional bids that win work"

**Priority:** HIGH (Ship Month 2)  
**Complexity:** Medium  
**Dev Time:** 2-3 weeks

#### Problem
Messy, unprofessional bids lose contracts.

#### Solution
- Clean PDF bid generator
- Pull from Job Cost Estimator
- Client info management
- Terms & conditions
- Digital sharing

#### UI Flow
```
┌─────────────────────────────────┐
│  Bid/Quote Generator             │
├─────────────────────────────────┤
│ CLIENT INFO                      │
│ Name:    [John Smith]            │
│ Email:   [john@email.com]        │
│ Phone:   [(555) 123-4567]        │
│ Address: [123 Main St]           │
│                                  │
│ PROJECT DETAILS                  │
│ Project: [Deck Build]            │
│ Date:    [12/18/2025]            │
│ Valid:   [30 days]               │
│                                  │
│ LINE ITEMS                       │
│ 1. Materials & Labor $5,755      │
│    • Detailed breakdown...       │
│                                  │
│ 2. Permits & Overhead  $932      │
│                                  │
│ Subtotal:              $6,687    │
│ Tax (if applicable):   $___      │
│                                  │
│ TOTAL:                 $6,687    │
│                                  │
│ Payment Terms: 50% deposit,      │
│ balance on completion            │
│                                  │
│ [Preview] [Generate PDF] [Email] │
└─────────────────────────────────┘
```

#### Freemium
- **Free:** Basic template, up to 3 active quotes, PDF only
- **Pro:** Unlimited quotes, custom templates/logo, save clients, convert to invoice

#### Tech Stack
- LocalStorage for client list and quotes
- jsPDF for generation
- Email sharing via `mailto:` or Web Share API
- Optional: Firebase Function for shareable link

---

## 📊 Implementation Roadmap

### Week 1: Ultra Quick Wins (3 tools)
**Days 1-5**

| Day | Tool | Status |
|-----|------|--------|
| 1 | Time & Value Calculator | ⏳ Ready |
| 2 | Hourly Rate Calculator | ⏳ Ready |
| 3-4 | Project Profitability Calculator | ⏳ Ready |
| 5 | Testing & Polish | |

**Deliverable:** 3 core contractor calculators live

---

### Week 2-3: Pricing Tools (2 tools)
**Days 6-20**

| Week | Tool | Status |
|------|------|--------|
| 2 | Service Pricing Sheet Generator | ⏳ Ready |
| 3 | Material Cost Calculator | ⏳ Ready |

**Deliverable:** Professional pricing and material management

---

### Week 4-6: Comprehensive Bidding (2 tools)
**Days 21-42**

| Week | Tool | Status |
|------|------|--------|
| 4-5 | Job Cost Estimator | ⏳ Ready |
| 5-6 | Bid/Quote Generator | ⏳ Ready |

**Deliverable:** End-to-end bidding workflow

---

## 💰 Freemium Strategy

### Free Tier Limits (Per Tool)
| Tool | Free Limit | Pro Unlock |
|------|-----------|------------|
| Time & Value Calc | Single calc | Batch compare, save history |
| Hourly Rate Calc | Basic formula | Full breakdown, scenarios |
| Project Profit Calc | Total rev/cost only | Line items, save, actual tracking |
| Pricing Sheet | 5 services, basic PDF | Unlimited, branding, packages |
| Material Calculator | 10 materials | Unlimited, price history |
| Job Cost Estimator | 10 line items total | Unlimited, templates |
| Bid Generator | 3 active quotes | Unlimited, custom templates |

### Freemium Messaging
```
"You've used X of Y free calculations this month. 
Upgrade to Pro for unlimited access + save history."

"Want to save this estimate? Upgrade to Pro to 
save unlimited estimates and create reusable templates."

"Pro users can customize this with their logo and 
branding. Upgrade for $10/year."
```

---

## 🎨 Design System

### Common UI Patterns

**Calculator Card:**
```css
.calculator-card {
  border: 2px solid black;
  background: white;
  padding: 24px;
  box-shadow: 4px 4px 0 black; /* Swiss design */
}
```

**Color Coding:**
- 🟢 Green: Above target / profitable
- 🟡 Yellow: Near target / caution
- 🔴 Red: Below target / unprofitable

**Input Fields:**
- Currency: `$` prefix, comma separators
- Hours: Suffix with "hours" or "hrs"
- Percentages: `%` suffix
- All numbers: Right-aligned

**Buttons:**
- Primary: Black bg, white text
- Secondary: White bg, black border
- Success: Green bg, white text
- Upgrade: Blue bg (brand color)

---

## 🔗 Tool Integration Matrix

| From → To | Integration |
|-----------|-------------|
| Hourly Rate → Time & Value | Auto-pull target rate |
| Job Cost Estimator → Project Profitability | Auto-populate costs |
| Job Cost Estimator → Bid Generator | One-click export |
| Pricing Sheet → Bid Generator | Pull service prices |
| Material Calculator → Job Cost Estimator | Add materials to estimate |
| Project Profitability → AR | Convert to receivable |
| Bid Generator → AR | Convert accepted bid to AR |

**User Flow Example:**
1. Calculate Hourly Rate ($50/hr) → Save as target
2. Use Time & Value for quick job screening (compares to $50/hr)
3. For good jobs: Create Job Cost Estimate
4. Export estimate to Bid Generator
5. Send bid to client
6. If accepted: Convert to AR + Project Profitability tracking

---

## 📈 Success Metrics

### Adoption Targets (Month 3)
- 50%+ of users try at least 1 contractor tool
- 30%+ use contractor tools weekly
- 15%+ upgrade to Pro for contractor features

### Feature Usage
- Time & Value Calculator: 60% of contractors (ultra high)
- Hourly Rate Calculator: 50% of contractors
- Project Profitability: 40% of contractors
- Job Cost Estimator: 30% of contractors
- Bid Generator: 25% of contractors

### Pro Conversion Drivers
Most likely to drive upgrades:
1. Job Cost Estimator (save templates)
2. Bid Generator (unlimited quotes)
3. Project Profitability (save & compare)

---

## 🚨 Anti-Patterns to Avoid

**❌ DON'T:**
- Give financial advice ("You should charge $X")
- Store credit card info or payment credentials
- Auto-send invoices/bids (user must initiate)
- Guarantee accuracy of estimates
- Provide legal contract templates
- Calculate taxes automatically (user inputs rates)

**✅ DO:**
- Use calculator/estimator language
- Provide example scenarios
- Show formulas/breakdowns
- Let users override all calculations
- Include disclaimer: "For estimation purposes only"

---

## 🎯 Marketing Messaging

### Homepage Hero
**"The Financial App Built for Contractors"**

*Track your cash, price your work right, and create professional bids—all in one place. No complicated accounting. Just clarity.*

[Start Free] [See Contractor Tools]

### Feature Highlights

**💰 Know Your Worth**
Calculate your true hourly rate accounting for overhead, taxes, and non-billable time.

**📊 Bid with Confidence**
Comprehensive job cost estimator ensures you never miss hidden expenses.

**📄 Win More Work**
Generate professional bids and pricing sheets in minutes, not hours.

**💡 Stay Profitable**
Track project profitability from estimate to completion.

---

## 🛠️ Technical Implementation Notes

### Shared Utilities

**`contractorUtils.ts`**
```typescript
// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Percentage formatting
export const formatPercent = (value: number): string => {
  return `${value}%`;
};

// Color coding logic
export const getRateColor = (actual: number, target: number): 'green' | 'yellow' | 'red' => {
  const ratio = actual / target;
  if (ratio >= 1) return 'green';
  if (ratio >= 0.9) return 'yellow';
  return 'red';
};

// Profit margin calculation
export const calculateMargin = (revenue: number, costs: number): number => {
  return ((revenue - costs) / revenue) * 100;
};
```

### LocalStorage Schema

**Material Database:**
```typescript
interface Material {
  id: string;
  name: string;
  unit: string; // 'each', 'sqft', 'lf', etc.
  currentPrice: number;
  priceHistory: Array<{
    date: string;
    price: number;
  }>;
  supplier?: string;
}
```

**Job Estimate:**
```typescript
interface JobEstimate {
  id: string;
  name: string;
  createdAt: string;
  materials: Array<LineItem>;
  labor: Array<LineItem>;
  equipment: Array<LineItem>;
  permits: Array<LineItem>;
  overheadPercent: number;
  contingencyPercent: number;
  profitMarginPercent?: number;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
```

---

## 🎓 Learning Resources

### For Users
- Video: "Pricing Your Services in 5 Minutes"
- Guide: "How to Create a Professional Bid"
- Template: "Standard Payment Terms"
- Calculator Guide: "Understanding Your True Hourly Rate"

### In-App Tips
```
💡 Tip: Add 10-15% contingency to all job estimates 
to cover unexpected costs.

💡 Tip: Your hourly rate should be 2-3x higher than 
an employee's wage to cover overhead and profit.

💡 Tip: Update material prices monthly to keep 
estimates accurate.
```

---

## ✅ Ready to Build

All 7 tools are fully specified and ready for development. Start with the 3 ultra-quick wins (Week 1) to validate the concept and drive early Pro conversions.

**Next Step:** Begin development on Tool 1 (Time & Value Calculator) - estimated 1 day.
