import { CalculationResult } from "../types";
import { Capacitor } from '@capacitor/core';

// TODO: After deploying functions, paste your URL here.
// Example: https://generatefinancialinsight-x8234-uc.a.run.app
const FUNCTION_URL = 'YOUR_CLOUD_FUNCTION_URL_HERE'; 

export const generateFinancialInsight = async (
  data: CalculationResult,
  rawBreakdown: string
): Promise<string> => {
  
  // Graceful Fallback / Demo Mode if URL is not set
  if (!FUNCTION_URL || FUNCTION_URL.includes('YOUR_CLOUD_FUNCTION_URL')) {
      console.warn("Cloud Function URL not set. Returning demo data.");
      
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

(Note: Deploy Firebase Functions to enable live Gemini 2.5 AI analysis)`;
  }

  try {
    const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            calculations: data,
            bankBreakdown: rawBreakdown
        })
    });

    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    return result.insight || "No insight returned.";

  } catch (error) {
    console.error("AI Service Error:", error);
    return "Unable to generate insights at this time. Please check your network connection.";
  }
};