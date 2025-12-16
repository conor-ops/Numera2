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
exports.generateFinancialInsight = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const generative_ai_1 = require("@google/generative-ai");
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
const API_KEY = process.env.GEMINI_API_KEY;
exports.generateFinancialInsight = (0, https_1.onRequest)({ secrets: ["GEMINI_API_KEY"] }, (request, response) => {
    corsHandler(request, response, async () => {
        // Validate Method
        if (request.method !== "POST") {
            response.status(405).send("Method Not Allowed");
            return;
        }
        // Validate Key
        if (!API_KEY) {
            logger.error("GEMINI_API_KEY is not set");
            response.status(500).json({ error: "Server misconfiguration" });
            return;
        }
        try {
            // Extract Data
            const { calculations, bankBreakdown } = request.body;
            // Init AI
            const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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
            response.json({ insight: responseText });
        }
        catch (error) {
            logger.error("Gemini Error", error);
            response.status(500).json({ error: "Failed to generate insight" });
        }
    });
});
