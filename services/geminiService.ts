import { GoogleGenAI } from "@google/genai";
import { CalculationResult } from "../types";

// Use environment variable or fallback to the provided key for the demo
const API_KEY = process.env.API_KEY || 'AIzaSyAauvPbsV-P7Js7KANnQvAun7CyKIa6G1E';

export const generateFinancialInsight = async (
  data: CalculationResult,
  rawBreakdown: string
): Promise<string> => {
  if (!API_KEY) {
    return "API Key is missing. Please configure process.env.API_KEY to use AI insights.";
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
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights at this time. Please check your network or API key.";
  }
};