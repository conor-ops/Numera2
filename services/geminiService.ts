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

    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    return result.insight || "No insight returned.";

  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};
