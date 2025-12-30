import { GoogleGenAI } from "@google/genai";
import { CalculationResult } from "../types";

// For the main summary, we use a Cloud Function to keep the logic and prompts secure
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

// For Runway analysis, we use the direct SDK for low-latency feedback
// Ensure VITE_GEMINI_API_KEY is set in your .env.local
export const generateRunwayInsight = async (
  currentBne: number,
  monthlyBurn: number,
  pendingAr: number
): Promise<string> => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) return "AI insights require an active API connection.";

  try {
    const ai = new GoogleGenAI(API_KEY);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const days = monthlyBurn > 0 ? (currentBne / (monthlyBurn / 30)).toFixed(0) : 'Infinite';
    
    const prompt = `
      Perform a stress test on a freelancer's cash runway.
      Current Net Assets (BNE): $${currentBne.toFixed(2)}
      Monthly Burn Rate (Fixed Costs): $${monthlyBurn.toFixed(2)}
      Pending Invoices (AR): $${pendingAr.toFixed(2)}
      Estimated Survival: ${days} days.

      Provide a 3-sentence "Reality Check". 
      1. One sentence on the current danger level.
      2. One sentence on the impact if the AR invoices are delayed by 30 days.
      3. One actionable advice to extend the runway.
      Be blunt and precise.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Runway analysis failed.";
  } catch (error) {
    console.error("Gemini Runway Error:", error);
    return "Predictor engine unavailable.";
  }
};
