import { CalculationResult } from "../types";

// We use relative paths here. Firebase Hosting handles the rewrite to the Cloud Function.
// This prevents CORS issues and manages environment URLs automatically.
const INSIGHT_ENDPOINT = '/api/generateFinancialInsight';
const RUNWAY_ENDPOINT = '/api/generateRunwayInsight';

export const generateFinancialInsight = async (
  data: CalculationResult,
  rawBreakdown: string
): Promise<string> => {
  try {
    const response = await fetch(INSIGHT_ENDPOINT, {
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

export const generateRunwayInsight = async (
  currentBne: number,
  monthlyBurn: number,
  pendingAr: number
): Promise<string> => {
  try {
    const response = await fetch(RUNWAY_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            currentBne,
            monthlyBurn,
            pendingAr
        })
    });

    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    return result.insight || "Runway analysis failed.";
  } catch (error) {
    console.error("Gemini Runway Error:", error);
    return "Predictor engine unavailable.";
  }
};