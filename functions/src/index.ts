/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cors from "cors";

// Initialize CORS handler to allow requests from any domain (or restrict to yours)
const corsHandler = cors({ origin: true });

// 1. Get the API Key from the environment (Secure)
// In Firebase console: firebase functions:secrets:set GEMINI_API_KEY
const API_KEY = process.env.GEMINI_API_KEY;

export const generateFinancialInsight = onRequest(
  { secrets: ["GEMINI_API_KEY"] }, // Access the secret
  (request, response) => {
    corsHandler(request, response, async () => {
      // 2. Validate Request
      if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
      }

      if (!API_KEY) {
        logger.error("GEMINI_API_KEY is not set");
        response.status(500).json({ error: "Server misconfiguration" });
        return;
      }

      try {
        const { calculations, bankBreakdown } = request.body;

        if (!calculations) {
            response.status(400).json({ error: "Missing calculation data" });
            return;
        }

        // 3. Initialize Gemini (Server-Side)
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 4. Construct Prompt
        const prompt = `
          As a senior financial analyst, provide a brief, actionable executive summary (max 100 words) for a business with the following current snapshot:
          
          - Total Liquid Cash (Bank): $${calculations.totalBank}
          - Total Credit Debt: $${calculations.totalCredit}
          - Net Cash Position: $${calculations.netBank}
          
          - Accounts Receivable (AR): $${calculations.totalAR}
          - Accounts Payable (AP): $${calculations.totalAP}
          - Net Operational Float: $${calculations.netReceivables}
          
          - Business Net Exact (BNE): $${calculations.bne}
          
          Additional Context on Bank Breakdown:
          ${bankBreakdown}
          
          Focus on liquidity and solvency. Provide one key recommendation. Use a professional but direct tone.
        `;

        // 5. Generate Content
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // 6. Return Response to Client
        response.json({ insight: text });

      } catch (error: any) {
        logger.error("Gemini Error", error);
        response.status(500).json({ error: error.message || "Failed to generate insight" });
      }
    });
  }
);