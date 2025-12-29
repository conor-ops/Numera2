import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import Stripe from "stripe";

// Initialize CORS handler with an explicit origin whitelist
const allowedOrigins = [
  "http://localhost:3000",
  // Add your production frontend origins here, e.g.:
  // "https://your-production-domain.com",
];
const allowedOriginsSet = new Set(allowedOrigins);

const corsHandler = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Require an explicit Origin header and only allow whitelisted origins
    if (!origin) {
      callback(new Error("Origin required"));
      return;
    }

    if (allowedOriginsSet.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
});
// --- GEN AI FUNCTION ---
// The secret "API_KEY" must be set in Firebase via `firebase functions:secrets:set API_KEY`
export const generateFinancialInsight = onRequest(
  { secrets: ["API_KEY"] },
  (request, response) => {
    corsHandler(request, response, async () => {
      // 1. Validate Request
      if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
      }

      // 2. Initialize Client with Secret
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        logger.error("API_KEY secret is not set");
        response.status(500).json({ error: "Server misconfiguration" });
        return;
      }

      try {
        const { calculations, bankBreakdown } = request.body;

        if (!calculations) {
            response.status(400).json({ error: "Missing calculation data" });
            return;
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        // 3. Construct Prompt
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

        // 4. Generate Content using gemini-2.5-flash
        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        // 5. Return Response
        response.json({ insight: result.text });

      } catch (error: any) {
        logger.error("Gemini Error", error);
        response.status(500).json({ error: error.message || "Failed to generate insight" });
      }
    });
  }
);

// --- STRIPE PAYMENT FUNCTION ---
// The secret "STRIPE_SECRET_KEY" must be set via `firebase functions:secrets:set STRIPE_SECRET_KEY`
export const createStripeCheckoutSession = onRequest(
  { secrets: ["STRIPE_SECRET_KEY"] },
  (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
      }

      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        logger.error("STRIPE_SECRET_KEY is not set");
        response.status(500).json({ error: "Server payment misconfiguration" });
        return;
      }

      try {
        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
        const { returnUrl } = request.body;

        // Validate returnUrl against allowed origins
        if (!returnUrl || typeof returnUrl !== 'string') {
          response.status(400).json({ error: "Missing or invalid returnUrl" });
          return;
        }

        const isValidOrigin = allowedOrigins.some(origin => returnUrl.startsWith(origin));
        if (!isValidOrigin) {
          logger.warn(`Invalid returnUrl attempted: ${returnUrl}`);
          response.status(400).json({ error: "Invalid returnUrl" });
          return;
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Numera Pro Annual',
                  description: 'Unlimited PDF Exports & Cloud Sync',
                },
                unit_amount: 1000, // $10.00
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: returnUrl,
        });

        response.json({ url: session.url });
      } catch (error: any) {
        logger.error("Stripe Error", error);
        response.status(500).json({ error: error.message || "Failed to create checkout session" });
      }
    });
  }
);