# Gemini Prompt: Create Contractor Outsourcing Package

**Date:** December 18, 2025  
**Purpose:** Generate complete job posts and handoff documentation for outsourcing Numera contractor tools

---

## 🎯 Prompt for Gemini

```
You are an expert technical project manager helping me outsource development work for my financial SaaS app called Numera. I need you to create a complete contractor outsourcing package.

CONTEXT:
- App: Numera - A financial clarity app for freelancers/contractors
- Tech Stack: React, TypeScript, Vite, Firebase, LocalStorage
- Goal: Outsource 3 simple calculator tools to speed up development
- Budget: $500-1,000 for 3 calculators
- Timeline: 3-5 days turnaround

TOOLS TO OUTSOURCE (Phase 1):

1. Time & Value Calculator
   - Input: Job price ($), estimated hours, optional material costs
   - Output: Effective hourly rate, daily rate, comparison to target rate
   - Visual: Color-coded (green/yellow/red) based on target
   - Storage: Target rate in LocalStorage
   - Freemium: Free = single calc, Pro = batch compare + history

2. Hourly Rate Calculator
   - Input: Desired annual income, billable hours/year, annual overhead, tax rate, profit margin
   - Output: Required hourly rate with breakdown (base + overhead + tax + profit)
   - Feature: "Save as Target Rate" button
   - Formula: (Income + Overhead) / (Billable Hours × (1 - Tax Rate)) × (1 + Profit Margin)
   - Freemium: Free = basic calc, Pro = full breakdown + save scenarios

3. Project Profitability Calculator
   - Input: Project name, total revenue, labor costs, material costs, equipment, permits, other
   - Output: Gross profit ($), profit margin (%)
   - Feature: Optional "Add to AR" (Accounts Receivable) integration
   - Storage: Save projects in LocalStorage (Pro only)
   - Freemium: Free = basic calc, Pro = detailed line items + save

TECHNICAL REQUIREMENTS:
- Must integrate with existing React/TypeScript codebase
- Use LocalStorage for data persistence
- Mobile-responsive (works on phones/tablets)
- Follow existing component patterns (see example below)
- No backend/API calls needed (100% client-side)
- Clean, documented TypeScript code

EXISTING COMPONENT PATTERN EXAMPLE:
```typescript
interface CalculatorProps {
  onUpgrade?: () => void;
  isPro: boolean;
}

const Calculator: React.FC<CalculatorProps> = ({ isPro, onUpgrade }) => {
  const [result, setResult] = useState<number | null>(null);
  
  // Component logic here
  
  return (
    <div className="calculator-card">
      {/* UI here */}
    </div>
  );
};
```

DESIGN SYSTEM:
- Swiss/brutalist design with black borders
- Color coding: Green (good), Yellow (caution), Red (warning)
- Input fields: Currency with $ prefix, right-aligned numbers
- Buttons: Primary (black bg), Secondary (white bg, black border)
- Cards: 2px black border, 4px shadow

PLEASE CREATE:

1. UPWORK JOB POST
   - Attention-grabbing title
   - Clear project description
   - Exact deliverables
   - Timeline and budget
   - Required skills
   - Screening questions for applicants
   - Payment terms

2. FIVERR GIG DESCRIPTION
   - Shorter, punchier version
   - 3 package tiers (Basic/Standard/Premium)
   - Clear deliverables per tier
   - FAQ section

3. TECHNICAL HANDOFF DOCUMENT
   - Overview of what needs to be built
   - Technical specifications for each calculator
   - UI mockups (text-based ASCII art)
   - TypeScript interfaces
   - LocalStorage schema
   - Integration points with existing app
   - Testing requirements
   - Acceptance criteria

4. CONTRACTOR ONBOARDING GUIDE
   - How to access codebase
   - How to run the app locally
   - Coding standards
   - Component patterns to follow
   - How to submit work
   - Communication expectations

5. WORK ACCEPTANCE CHECKLIST
   - Code quality checks
   - Functionality tests
   - Responsive design checks
   - Performance checks
   - Documentation review

6. COMMON CONTRACTOR QUESTIONS & ANSWERS
   - "What if I need clarification?"
   - "Can I use external libraries?"
   - "How many revisions are included?"
   - "When do I get paid?"

TONE & STYLE:
- Professional but friendly
- Clear and specific (no ambiguity)
- Realistic about scope and timeline
- Emphasize simplicity (these are calculators, not complex features)
- Budget-conscious (target junior-to-mid level developers)

IMPORTANT CONSTRAINTS:
- No backend required (must be 100% client-side)
- No new dependencies if possible (use existing)
- Must not break existing features
- Must follow existing code patterns
- No access to production database (everything is LocalStorage)

OUTPUT FORMAT:
Please create each document as a separate section with clear headers, ready to copy/paste into:
- Upwork job post form
- Fiverr gig creation
- Google Docs for contractor handoff
- Notion/Markdown for internal checklist

Make the documents detailed enough that a contractor could start work immediately with minimal questions, but concise enough that they actually read it.

Include realistic budget breakdowns, timeline estimates, and examples wherever helpful.
```

---

## 📋 What to Do Next

1. **Copy the entire prompt above** (starting from "You are an expert...")
2. **Paste it into Google AI Studio** or Gemini
3. **Review the output** and customize as needed
4. **Share the result** with me and I'll help you refine it
5. **Post to Upwork/Fiverr** and start interviewing contractors

---

## 🎯 Expected Output

Gemini should generate:
- ✅ Complete Upwork job post (ready to publish)
- ✅ Fiverr gig description with 3 pricing tiers
- ✅ Technical handoff doc (15-20 pages)
- ✅ Contractor onboarding guide
- ✅ Acceptance checklist
- ✅ FAQ for contractors

**Total:** ~30-40 pages of contractor documentation

---

## 💡 Tips for Using the Output

### After Gemini Generates:

**1. Review for Accuracy**
- Check technical specs match our tools
- Verify budget aligns with your comfort level
- Ensure timeline is realistic (3-5 days)

**2. Customize**
- Add your GitHub repo link
- Add your contact info (email/Discord)
- Adjust budget if needed
- Add specific screening questions

**3. Test the Handoff Doc**
- Does it explain everything clearly?
- Are UI mockups understandable?
- Is code example helpful?
- Would you understand it if you were the contractor?

**4. Post & Iterate**
- Start with Upwork (more professional)
- If you get good applicants, hire
- If not, adjust job post based on questions
- Consider raising budget slightly if no quality responses

---

## 🚀 Quick Start Commands

### After Getting Gemini Output:

**To post on Upwork:**
1. Go to upwork.com/nx/create-job
2. Paste generated job post
3. Set budget: $500-800 (fixed price)
4. Add skill requirements: React, TypeScript, JavaScript
5. Publish!

**To post on Fiverr:**
1. Go to fiverr.com/users/[username]/seller_dashboard
2. Click "Create a New Gig Request"
3. Paste Fiverr gig description
4. Set budget: $500-800
5. Publish!

**To prepare handoff:**
1. Create Google Doc from Gemini's technical handoff
2. Add your repo link
3. Share with contractor once hired

---

## ⏱️ Timeline After Posting

**Day 0 (Today):**
- Generate docs with Gemini
- Post to Upwork/Fiverr

**Day 1-2:**
- Review applicants (expect 10-30)
- Interview top 3-5
- Check portfolios

**Day 3:**
- Hire contractor
- Send handoff doc
- Grant repo access

**Day 4-8:**
- Contractor works (3-5 days)
- Answer questions
- Review daily progress

**Day 9:**
- Final review
- Request revisions if needed
- Merge code

**Day 10:**
- Pay contractor
- Ship features! 🚀

---

## 💰 Budget Negotiation Tips

**If contractor says it's too much work:**
- Offer to split into 2 milestones ($250 for first calculator, then $500 for remaining 2)
- Reduce scope (just Time & Value Calculator first)
- Ask what price works for them

**If contractor lowballs (<$300):**
- Good deal, but verify quality with portfolio review
- Ask more screening questions
- Consider paying more for better quality

**Sweet spot:**
- $500-800 total = good balance of quality and affordability
- ~$150-250 per calculator
- Junior-to-mid level dev can complete in 3-5 days

---

## ✅ Ready!

Once you paste the prompt into Gemini and get the output, share it with me and I'll help you:
- Refine the job posts
- Review technical specs
- Prepare interview questions
- Create evaluation criteria

**This approach lets us leverage AI to do the tedious documentation work while you focus on finding the right contractor!** 🚀
