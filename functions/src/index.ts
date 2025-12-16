import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {GoogleGenerativeAI} from "@google/generative-ai";
import * as cors from "cors";

const corsHandler = cors({origin: true});
const API_KEY = process.env.GEMINI_API_KEY;

export const generateFinancialInsight = onRequest(
  {secrets: ["GEMINI_API_KEY"]},
  (request, response) => {
    corsHandler(request, response, async () => {
      // Validate Method
      if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
      }

      // Validate Key
      if (!API_KEY) {
        logger.error("GEMINI_API_KEY is not set");
        response.status(500).json({error: "Server misconfiguration"});
        return;
      }

      try {
        // Extract Data
        const {calculations, bankBreakdown} = request.body;

        // Init AI
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({model: "gemini-pro"});

        const prompt = `
          As a senior financial analyst, provide a brief, actionable executive summary (max 100 words) for a business with the following current snapshot:
          
          - Total Liquid Cash: $${calculations.totalBank}
          - Total Credit Debt: $${calculations.totalCredit}
          - Net Cash Position: $${calculations.netBank}
          - BNE: $${calculations.bne}
          
          Bank Breakdown: ${bankBreakdown}
          
          Focus on liquidity. Provide one key recommendation.
        `;

        // Generate
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        response.json({insight: responseText});

      } catch (error: any) {
        logger.error("Gemini Error", error);
        response.status(500).json({error: "Failed to generate insight"});
      }
    });
  }
);