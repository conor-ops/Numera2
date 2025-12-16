import { CalculationResult } from "../types";

// We use a relative path here. Firebase Hosting handles the rewrite to the Cloud Function.
// This prevents CORS issues and manages environment URLs automatically.
const FUNCTION_ENDPOINT = '/api/generateFinancialInsight';

export const generateFinancialInsight = async (
  data: CalculationResult,
  rawBreakdown: string
): Promise<string> => {
  
  try {
    const response = await fetch(FUNCTION_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            calculations: data,
            bankBreakdown: rawBreakdown
        })
    });

    // If the backend is not deployed or 404s, we fall back to local demo mode for UI testing
    if (response.status === 404) {
        console.warn("Backend function not found (404). Falling back to demo mode.");
        return getDemoInsight(data);
    }

    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    return result.insight || "No insight returned.";

  } catch (error) {
    console.error("AI Service Error:", error);
    // Fallback for network errors or offline usage
    return getDemoInsight(data);
  }
};

const getDemoInsight = async (data: CalculationResult): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const isHealthy = data.bne > 0;
    const isLiquid = data.netBank > 0;

    return `[DEMO MODE] Executive Summary:

The business is currently in a ${isHealthy ? 'stable' : 'vulnerable'} solvency position with a Business Net Exact (BNE) of $${data.bne.toLocaleString()}. 

Liquidity is ${isLiquid ? 'sufficient' : 'tight'}, with ${isLiquid ? 'surplus cash available' : 'a reliance on credit'} to cover immediate obligations.

Recommendation: ${isHealthy 
    ? 'Consider allocating excess operational float into high-yield savings or reinvesting in growth channels.' 
    : 'Prioritize Accounts Receivable collections immediately and defer non-essential payables to preserve cash flow.'}

(Note: Ensure Firebase Functions are deployed and rewrites are configured in firebase.json)`;
};