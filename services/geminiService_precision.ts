
import { GoogleGenAI } from "@google/genai";
import { CalculationResult } from "../types";

const API_KEY = process.env.API_KEY;

export const generateFinancialInsight = async (
  data: CalculationResult,
  rawBreakdown: string
): Promise<string> => {
  if (!API_KEY) {
    return "API Key is missing. Please configure your environment to use AI insights.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `
      As a senior financial analyst, provide a brief, actionable executive summary (max 100 words) for a business with the following current snapshot:
      
      - Total Liquid Cash (Bank): $${data.totalBank.toFixed(2)}
      - Total Credit Debt: $${data.totalCredit.toFixed(2)}
      - Net Cash Position (Bank - Credit): $${data.netBank.toFixed(2)}
      
      - Accounts Receivable (AR): $${data.totalAR.toFixed(2)}
      - Accounts Payable (AP): $${data.totalAP.toFixed(2)}
      - Net Operational Float (AR - AP): $${data.netReceivables.toFixed(2)}
      
      - Business Net Exact (BNE): $${data.bne.toFixed(2)}
      
      Additional Context on Bank Breakdown:
      ${rawBreakdown}
      
      Focus on liquidity and solvency. Provide one key recommendation. Use a professional but direct tone.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights at this time.";
  }
};

export const generateRunwayInsight = async (
  currentBne: number,
  monthlyBurn: number,
  pendingAr: number
): Promise<string> => {
  if (!API_KEY) return "AI insights require an active API connection.";

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Runway analysis failed.";
  } catch (error) {
    console.error("Gemini Runway Error:", error);
    return "Predictor engine unavailable.";
  }
};
