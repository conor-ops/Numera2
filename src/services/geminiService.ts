import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { CalculationResult, Transaction, BusinessDocument, PricingItem, AuditResult } from "../types";

const API_KEY = process.env.API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

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

// Helper for the "Thinking" features from the user snippet
export const generateWithThinking = async (prompt: string) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-thinking-exp", // Specifically for thinking features
    tools: [
      { googleSearch: {} } as any,
      { codeExecution: {} } as any
    ]
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  return result.response.text();
};

export const scoreOpportunity = async (
  opportunityDesc: string,
  financialContext: string
): Promise<OpportunityScore> => {
  if (!API_KEY) throw new Error("API Key missing");
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          score: { type: SchemaType.NUMBER },
          verdict: { type: SchemaType.STRING },
          pros: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          cons: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          riskLevel: { type: SchemaType.STRING, enum: ["LOW", "MEDIUM", "HIGH"] }
        },
        required: ["score", "verdict", "pros", "cons", "riskLevel"]
      }
    }
  });
  
  const prompt = `
    Strategic Analysis Request: "${opportunityDesc}"
    Business Context: ${financialContext}
    
    Evaluate this opportunity. Consider cash flow impact, margin potential, and strategic fit.
    Provide a score 0-100, a short verdict, 3 pros, 3 cons, and a risk level.
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

export const parseContract = async (
  fileData: { data: string, mimeType: string }
): Promise<ContractExtraction> => {
  if (!API_KEY) throw new Error("API Key missing");
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          clientName: { type: SchemaType.STRING },
          totalValue: { type: SchemaType.NUMBER },
          summary: { type: SchemaType.STRING },
          milestones: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                description: { type: SchemaType.STRING },
                amount: { type: SchemaType.NUMBER },
                dueDate: { type: SchemaType.STRING }
              },
              required: ["description", "amount", "dueDate"]
            }
          }
        },
        required: ["clientName", "totalValue", "milestones", "summary"]
      }
    }
  });

  const prompt = "Analyze this contract or purchase order. Extract the Client Name, the Total Contract Value, and a list of specific payment milestones (description, amount, and approximate due date).";

  const result = await model.generateContent([
    { text: prompt },
    { inlineData: fileData }
  ]);
  return JSON.parse(result.response.text());
};

export const performInvoiceAudit = async (doc: BusinessDocument, pricingSheet: PricingItem[]): Promise<AuditResult> => {
  if (!API_KEY) throw new Error("API Key missing");
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          score: { type: SchemaType.NUMBER },
          summary: { type: SchemaType.STRING },
          issues: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                type: { type: SchemaType.STRING },
                message: { type: SchemaType.STRING },
                impact: { type: SchemaType.STRING }
              },
              required: ["type", "message", "impact"]
            }
          }
        },
        required: ["score", "summary", "issues"]
      }
    }
  });

  const prompt = `Perform audit on ${doc.type}. Invoice: ${JSON.stringify(doc)}. Pricing: ${JSON.stringify(pricingSheet)}`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

export const sendChatMessage = async (message: string, history: any[], fileData?: any): Promise<ChatResponse> => {
  if (!API_KEY) return { text: "AI requires an active API connection." };
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_INSTRUCTION
  });

  const chat = model.startChat({
    history: history.map(h => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: h.parts?.[0]?.text || h.text || "" }]
    }))
  });

  const parts: any[] = [{ text: message }];
  if (fileData) parts.push({ inlineData: fileData });

  const result = await chat.sendMessage(parts);
  
  try {
    return JSON.parse(result.response.text());
  } catch {
    return { text: result.response.text() };
  }
};

export const generateFinancialInsight = async (data: CalculationResult, rawBreakdown: string): Promise<string> => {
  if (!API_KEY) return "API Key is missing.";
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Insight for BNE $${data.bne.toFixed(2)}. ${rawBreakdown}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const generateRunwayInsight = async (currentBne: number, monthlyBurn: number, pendingAr: number): Promise<string> => {
  if (!API_KEY) return "AI insights require connection.";
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Runway analysis: BNE $${currentBne}, Burn $${monthlyBurn}/mo, AR $${pendingAr}.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const generateMarketIntel = async (query: string): Promise<MarketIntelResponse> => {
  if (!API_KEY) return { text: "Search grounding requires connection.", sources: [] };
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    tools: [{ googleSearch: {} }] as any
  });

  const result = await model.generateContent(query);
  const text = result.response.text();
  
  const sources: {title: string, uri: string}[] = [];
  const metadata = result.response.candidates?.[0]?.groundingMetadata;
  if (metadata?.groundingChunks) {
    metadata.groundingChunks.forEach(chunk => {
      if (chunk.web) {
        sources.push({ title: chunk.web.title || "Reference", uri: chunk.web.uri || "" });
      }
    });
  }

  return { text, sources };
};