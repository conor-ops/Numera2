/**
 * Solventless Precision Finance OS - Backend Services
 * Last Optimized: 2025-12-30
 */
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import Stripe from "stripe";
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ 
  maxInstances: 10,
  region: "us-central1"
});

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://Solventless-481417.web.app",
  "https://Solventless-481417.firebaseapp.com",
];
const allowedOriginsSet = new Set(allowedOrigins);

const corsHandler = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOriginsSet.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
});

// --- GEN AI: FINANCIAL INSIGHT ---
export const generateFinancialInsight = onRequest(
  { 
    secrets: ["API_KEY"], 
    memory: "512MiB",
    cpu: 1,
    timeoutSeconds: 120
  },
  (request, response) => {
    corsHandler(request, response, async () => {
      logger.info("[Insight] Request received", { body: request.body });
      if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
      }

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

        // Correct constructor for @google/generative-ai
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        response.json({ insight: text });

      } catch (error: any) {
        logger.error("Gemini Error", error);
        response.status(500).json({ error: error.message || "Failed to generate insight" });
      }
    });
  }
);

// --- GEN AI: RUNWAY INSIGHT ---
export const generateRunwayInsight = onRequest(
  { 
    secrets: ["API_KEY"], 
    memory: "512MiB",
    cpu: 1,
    timeoutSeconds: 120
  },
  (request, response) => {
    corsHandler(request, response, async () => {
      logger.info("[Runway] Request received", { body: request.body });
      if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
      }

      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        logger.error("API_KEY secret is not set");
        response.status(500).json({ error: "Server misconfiguration" });
        return;
      }

      try {
        const { currentBne, monthlyBurn, pendingAr } = request.body;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const days = monthlyBurn > 0 ? (currentBne / (monthlyBurn / 30)).toFixed(0) : "Infinite";
        
        const prompt = `
          Perform a stress test on a freelancer's cash runway.
          Current Net Assets (BNE): $${(currentBne || 0).toFixed(2)}
          Monthly Burn Rate (Fixed Costs): $${(monthlyBurn || 0).toFixed(2)}
          Pending Invoices (AR): $${(pendingAr || 0).toFixed(2)}
          Estimated Survival: ${days} days.

          Provide a 3-sentence "Reality Check". 
          1. One sentence on the current danger level.
          2. One sentence on the impact if the AR invoices are delayed by 30 days.
          3. One actionable advice to extend the runway.
          Be blunt and precise.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        response.json({ insight: text });
      } catch (error: any) {
        logger.error("Gemini Runway Error", error);
        response.status(500).json({ error: error.message || "Predictor engine unavailable." });
      }
    });
  }
);

// --- STRIPE: CHECKOUT SESSION ---
export const createStripeCheckoutSession = onRequest(
  { 
    secrets: ["STRIPE_SECRET_KEY"], 
    memory: "512MiB",
    cpu: 1,
    timeoutSeconds: 120
  },
  (request, response) => {
    corsHandler(request, response, async () => {
      logger.info("[Checkout] Request received", { body: request.body });
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
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-01-27.acacia" as any });
        const { returnUrl, planType, invoiceId, amount: requestedAmount } = request.body;

        if (!returnUrl || typeof returnUrl !== "string") {
          response.status(400).json({ error: "Missing or invalid returnUrl" });
          return;
        }

        const isValidOrigin = allowedOrigins.some(origin => returnUrl.startsWith(origin));
        if (!isValidOrigin) {
          logger.warn(`Invalid returnUrl attempted: ${returnUrl}`);
          response.status(400).json({ error: "Invalid returnUrl" });
          return;
        }

        // Plan Configuration
        const plans: any = {
          pro: {
            name: "Solventless Pro Annual",
            description: "Unlimited AI Insights, Full History & Trends",
            amount: 1000, // $10.00
          },
          business: {
            name: "Solventless Business Annual",
            description: "Everything in Pro + Multi-Business, Team Access & Advanced Forecasting",
            amount: 2500, // $25.00
          }
        };

        const selectedPlan = plans[planType as string] || plans.pro;
        const finalCents = selectedPlan.amount || Math.round((requestedAmount || 10) * 100);

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: selectedPlan.name,
                  description: selectedPlan.description,
                },
                unit_amount: finalCents,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          metadata: {
            planType: planType || 'pro',
            invoiceId: invoiceId || '',
          },
          success_url: `${returnUrl}?payment_success=true&plan=${planType || 'pro'}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${returnUrl}?payment_canceled=true`,
        });

        response.json({ url: session.url });
      } catch (error: any) {
        logger.error("Stripe Error", error);
        response.status(500).json({ error: error.message || "Failed to create checkout session" });
      }
    });
  }
);

// --- STRIPE: WEBHOOK HANDLER ---
export const stripeWebhook = onRequest(
  { 
    secrets: ["STRIPE_WEBHOOK_SECRET", "STRIPE_SECRET_KEY"],
    memory: "512MiB",
    cpu: 1,
    timeoutSeconds: 120
  },
  async (request, response) => {
    if (request.method === "GET") {
      response.send("Webhook endpoint active");
      return;
    }

    const sig = request.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      response.status(400).send("Webhook Error: Missing signature or secret");
      return;
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
        response.status(500).send("Server Error: Stripe key not configured");
        return;
    }

    try {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-01-27.acacia" as any });
      const event = stripe.webhooks.constructEvent((request as any).rawBody, sig, webhookSecret);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          logger.info(`[Payment] Success! Session: ${session.id}`);
          break;
        }
        default:
          logger.info(`Unhandled event type ${event.type}`);
      }

      response.json({ received: true });
    } catch (err: any) {
      logger.error("Webhook Error", err.message);
      response.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);
