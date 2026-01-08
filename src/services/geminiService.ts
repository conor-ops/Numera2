
import { GoogleGenAI, Type } from "@google/genai";
import { CalculationResult, Transaction, BusinessDocument, AuditResult } from "../types";

const API_KEY = process.env.API_KEY;

export interface Milestone {
  description: string;
  amount: number;
  dueDate: string;
}

export interface ContractExtraction {
  milestones: Milestone[];
  totalValue: number;
  clientName: string;
  summary: string;
}

export interface ChatResponse {
  text: string;
  proposedTransaction?: {
    name: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
  };
}

export interface MarketIntelResponse {
  text: string;
  sources: { title: string; uri: string }[];
}

export interface OpportunityScore {
  score: number;
  verdict: string;
  pros: string[];
  cons: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

const SYSTEM_INSTRUCTION = `
You are the Solventless Financial Co-pilot. You help freelancers and small business owners manage their "Business Net Exact" (BNE).
Your tone is precise, helpful, and professional.
`;

export const scoreOpportunity = async (
  opportunityDesc: string,
  financialContext: string
): Promise<OpportunityScore> => {
  if (!API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    Strategic Analysis Request: "${opportunityDesc}"
    Business Context: ${financialContext}
    
    Evaluate this opportunity. Consider cash flow impact, margin potential, and strategic fit.
    Provide a score 0-100, a short verdict, 3 pros, 3 cons, and a risk level.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          verdict: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] }
        },
        required: ["score", "verdict", "pros", "cons", "riskLevel"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const parseContract = async (
  fileData: { data: string, mimeType: string }
): Promise<ContractExtraction> => {
  if (!API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = "Analyze this contract or purchase order. Extract the Client Name, the Total Contract Value, and a list of specific payment milestones (description, amount, and approximate due date).";

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: fileData }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clientName: { type: Type.STRING },
          totalValue: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          milestones: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                dueDate: { type: Type.STRING }
              },
              required: ["description", "amount", "dueDate"]
            }
          }
        },
        required: ["clientName", "totalValue", "milestones", "summary"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const performInvoiceAudit = async (doc: BusinessDocument): Promise<AuditResult> => {
  if (!API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Perform audit on ${doc.type}. Invoice: ${JSON.stringify(doc)}.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["WARNING", "OPTIMIZATION", "CRITICAL"] },
                message: { type: Type.STRING },
                impact: { type: Type.STRING }
              }
            }
          }
        },
        required: ["score", "summary", "issues"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const sendChatMessage = async (message: string, history: any[], fileData?: any): Promise<ChatResponse> => {
  if (!API_KEY) return { text: "AI requires an active API connection." };
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const parts: any[] = [{ text: message }];
  if (fileData) parts.push({ inlineData: fileData });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...history, { role: 'user', parts: parts }],
    config: { systemInstruction: SYSTEM_INSTRUCTION, responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const generateFinancialInsight = async (data: CalculationResult, rawBreakdown: string): Promise<string> => {
  if (!API_KEY) return "API Key is missing.";
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Insight for BNE $${data.bne.toFixed(2)}. ${rawBreakdown}`;
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: [{ role: 'user', parts: [{ text: prompt }] }] });
  return response.text || "No insights.";
};

export const generateRunwayInsight = async (currentBne: number, monthlyBurn: number, pendingAr: number): Promise<string> => {
  if (!API_KEY) return "AI insights require connection.";
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Runway analysis: BNE $${currentBne}, Burn $${monthlyBurn}/mo, AR $${pendingAr}.`;
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: [{ role: 'user', parts: [{ text: prompt }] }] });
  return response.text || "Runway analysis failed.";
};

export const generateMarketIntel = async (query: string): Promise<MarketIntelResponse> => {
  if (!API_KEY) return { text: "Search grounding requires connection.", sources: [] };
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: query }] }],
    config: { tools: [{ googleSearch: {} }] },
  });
  const text = response.text || "No response.";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = chunks.filter(c => c.web).map(c => ({ title: c.web?.title || "Ref", uri: c.web?.uri || "" })).filter(s => s.uri !== "");
  return { text, sources };
};

