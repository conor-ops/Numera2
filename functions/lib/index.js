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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStripeCheckoutSession = exports.generateFinancialInsight = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const genai_1 = require("@google/genai");
const cors_1 = __importDefault(require("cors"));
const stripe_1 = __importDefault(require("stripe"));
<<<<<<< HEAD
// Initialize CORS handler to allow requests from any domain
const corsHandler = (0, cors_1.default)({ origin: true });
=======
// Initialize CORS handler with an explicit origin whitelist
const allowedOrigins = [
    "http://localhost:3000",
    // Add your production frontend origins here, e.g.:
    // "https://your-production-domain.com",
];
const allowedOriginsSet = new Set(allowedOrigins);
const corsHandler = (0, cors_1.default)({
    origin: (origin, callback) => {
        // Only allow requests from explicitly whitelisted origins
        if (!origin || allowedOriginsSet.has(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
});
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
// --- GEN AI FUNCTION ---
// The secret "API_KEY" must be set in Firebase via `firebase functions:secrets:set API_KEY`
exports.generateFinancialInsight = (0, https_1.onRequest)({ secrets: ["API_KEY"] }, (request, response) => {
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
            const ai = new genai_1.GoogleGenAI({ apiKey: apiKey });
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
        }
        catch (error) {
            logger.error("Gemini Error", error);
            response.status(500).json({ error: error.message || "Failed to generate insight" });
        }
    });
});
// --- STRIPE PAYMENT FUNCTION ---
// The secret "STRIPE_SECRET_KEY" must be set via `firebase functions:secrets:set STRIPE_SECRET_KEY`
exports.createStripeCheckoutSession = (0, https_1.onRequest)({ secrets: ["STRIPE_SECRET_KEY"] }, (request, response) => {
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
            const stripe = new stripe_1.default(stripeKey, { apiVersion: '2023-10-16' });
            const { returnUrl } = request.body;
<<<<<<< HEAD
=======
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
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
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
<<<<<<< HEAD
                success_url: `${returnUrl}?payment_success=true`,
                cancel_url: `${returnUrl}?payment_canceled=true`,
=======
                success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: returnUrl,
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
            });
            response.json({ url: session.url });
        }
        catch (error) {
            logger.error("Stripe Error", error);
            response.status(500).json({ error: error.message || "Failed to create checkout session" });
        }
    });
});
//# sourceMappingURL=index.js.map