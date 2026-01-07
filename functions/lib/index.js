"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createStripeCheckoutSession = exports.generateRunwayInsight = exports.generateFinancialInsight = void 0;
/**
 * Numera Precision Finance OS - Backend Services
 * Last Optimized: 2025-12-30
 */
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const generative_ai_1 = require("@google/generative-ai");
const cors_1 = __importDefault(require("cors"));
const stripe_1 = __importDefault(require("stripe"));
const v2_1 = require("firebase-functions/v2");
(0, v2_1.setGlobalOptions)({
    maxInstances: 10,
    region: "us-central1"
});
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://numera-481417.web.app",
    "https://numera-481417.firebaseapp.com",
];
const allowedOriginsSet = new Set(allowedOrigins);
const corsHandler = (0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOriginsSet.has(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
});
// --- GEN AI: FINANCIAL INSIGHT ---
exports.generateFinancialInsight = (0, https_1.onRequest)({
    secrets: ["API_KEY"],
    memory: "512MiB",
    cpu: 1,
    timeoutSeconds: 120
}, (request, response) => {
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
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
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
        }
        catch (error) {
            logger.error("Gemini Error", error);
            response.status(500).json({ error: error.message || "Failed to generate insight" });
        }
    });
});
// --- GEN AI: RUNWAY INSIGHT ---
exports.generateRunwayInsight = (0, https_1.onRequest)({
    secrets: ["API_KEY"],
    memory: "512MiB",
    cpu: 1,
    timeoutSeconds: 120
}, (request, response) => {
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
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
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
        }
        catch (error) {
            logger.error("Gemini Runway Error", error);
            response.status(500).json({ error: error.message || "Predictor engine unavailable." });
        }
    });
});
// --- STRIPE: CHECKOUT SESSION ---
exports.createStripeCheckoutSession = (0, https_1.onRequest)({
    secrets: ["STRIPE_SECRET_KEY"],
    memory: "512MiB",
    cpu: 1,
    timeoutSeconds: 120
}, (request, response) => {
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
            const stripe = new stripe_1.default(stripeKey, { apiVersion: "2025-01-27.acacia" });
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
            const plans = {
                pro: {
                    name: "Numera Pro Annual",
                    description: "Unlimited AI Insights, Full History & Trends",
                    amount: 1000, // $10.00
                },
                business: {
                    name: "Numera Business Annual",
                    description: "Everything in Pro + Multi-Business, Team Access & Advanced Forecasting",
                    amount: 2500, // $25.00
                }
            };
            const selectedPlan = plans[planType] || plans.pro;
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
        }
        catch (error) {
            logger.error("Stripe Error", error);
            response.status(500).json({ error: error.message || "Failed to create checkout session" });
        }
    });
});
// --- STRIPE: WEBHOOK HANDLER ---
exports.stripeWebhook = (0, https_1.onRequest)({
    secrets: ["STRIPE_WEBHOOK_SECRET", "STRIPE_SECRET_KEY"],
    memory: "512MiB",
    cpu: 1,
    timeoutSeconds: 120
}, async (request, response) => {
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
        const stripe = new stripe_1.default(stripeKey, { apiVersion: "2025-01-27.acacia" });
        const event = stripe.webhooks.constructEvent(request.rawBody, sig, webhookSecret);
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                logger.info(`[Payment] Success! Session: ${session.id}`);
                break;
            }
            default:
                logger.info(`Unhandled event type ${event.type}`);
        }
        response.json({ received: true });
    }
    catch (err) {
        logger.error("Webhook Error", err.message);
        response.status(400).send(`Webhook Error: ${err.message}`);
    }
});
//# sourceMappingURL=index.js.map