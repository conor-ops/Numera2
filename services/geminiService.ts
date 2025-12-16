import { CalculationResult } from "../types";
import { Capacitor } from '@capacitor/core';

// TODO: After deploying functions, paste your URL here.
// Example: https://generatefinancialinsight-x8234-uc.a.run.app
const FUNCTION_URL = 'YOUR_CLOUD_FUNCTION_URL_HERE'; 

export const generateFinancialInsight = async (
  data: CalculationResult,
  rawBreakdown: string
): Promise<string> => {
  
  // Safety check to ensure URL is configured
  if (FUNCTION_URL.includes('YOUR_CLOUD_FUNCTION_URL')) {
      console.warn("Cloud Function URL not set. Returning mock data.");
      return "AI Configuration Incomplete. Please deploy the backend functions.";
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