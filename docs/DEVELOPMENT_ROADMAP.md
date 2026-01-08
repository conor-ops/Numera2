# Development Roadmap: The Job Site Profit Partner

This roadmap outlines the transformation of Solventless from a general financial tracker into an indispensable "Job Site Profit Partner" for service-based contractors (e.g., fencing, landscaping, painting).

## 1. Core Strategy: The "Contractor Core Loop"

Our development will focus on providing seamless, client-side tools for every stage of a contractor's job lifecycle. This "core loop" represents the primary workflow where we can add the most value.

1.  **Lead & Quote:** A potential client calls. The contractor needs to quickly and confidently calculate a profitable price on-site.
    *   **Pain Point:** Fluctuating material costs, estimating labor, and ensuring profit margin under pressure.

2.  **Project Prep & Execution:** The quote is accepted. The contractor schedules the job, buys materials, and manages the work.
    *   **Pain Point:** Tracking expenses against the budget and preventing scope creep from eating into profits.

3.  **Invoicing & Getting Paid:** The job is complete. An invoice must be generated, sent, and tracked.
    *   **Pain Point:** Manual invoice creation and the cash flow stress of chasing late payments.

4.  **Post-Job Analysis:** The money is in the bank. The contractor needs to know if the job was truly profitable and how much they can safely pay themselves.
    *   **Pain Point:** Distinguishing between revenue and actual profit after accounting for taxes and overhead.

## 2. Prioritized Feature Pipeline

The following features will be developed to directly serve the Contractor Core Loop.

### High Priority: Quote & Invoice Generator
*   **Description:** A tool to generate a professional quote from a cost calculation, which can then be converted into an invoice with one click.
*   **User Value:** Connects the beginning and end of a job, automates manual work, and ensures quotes are profitable.
*   **How it Works:**
    1.  The user builds a job cost estimate (materials, labor, margin).
    2.  The tool generates a clean PDF quote.
    3.  Upon job completion, the quote is converted to an invoice, which automatically appears in Accounts Receivable (AR), updating the BNE.
*   **Freemium Hook:** Free users get 3 quotes/invoices per month. Pro users get unlimited, customizable templates.

### Medium Priority: Simple Job Status Tracker
*   **Description:** A simple visual board to track the financial status of all jobs (e.g., Quoted -> Scheduled -> In Progress -> Invoiced -> Paid).
*   **User Value:** Provides a real-time view of the financial pipeline without the complexity of a full project management tool.
*   **Freemium Hook:** Free users can track up to 5 active jobs. Pro users get unlimited jobs.

### Low Priority: "Profit First" Visual Buckets
*   **Description:** A visual tool to allocate incoming revenue into virtual buckets for Profit, Owner's Pay, Tax, and Operating Expenses, based on the "Profit First" methodology.
*   **User Value:** Directly addresses the "Can I pay myself?" anxiety by providing a clear, actionable plan for managing cash.
*   **Freemium Hook:** Free users get 2 buckets. Pro users get all four and can customize percentages.

## 3. Lean R&D Strategy

As a solo-founder project, we will use a lean development process to mitigate risk:

1.  **User Interviews:** Validate the "Contractor Core Loop" and its pain points by talking to 3-5 real contractors before building.
2.  **Paper Prototyping:** Sketch and test user flows with contractors to get cheap and fast feedback.
3.  **Build Minimum Viable Features (MVFs):** Ship the simplest functional version of a feature to test its value in the real world before adding complexity.

## 4. Technical Considerations

*   **Client-Side Generation:** PDF quotes and invoices will be generated client-side using libraries like `jsPDF` to align with our backend-less architecture.
*   **Data Structure:** New top-level keys (`projects`, `materials`) will be added to the data structure in LocalStorage/SQLite to support these features.
