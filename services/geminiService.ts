
import { GoogleGenAI } from "@google/genai";
import { DailyJournal } from "../types";

export const getAITradingCoachAdvice = async (journal: DailyJournal[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const tradesContext = journal.map(j => ({
    date: j.date,
    pnl: j.trades.reduce((sum, t) => sum + t.pnl, 0),
    emotion: j.emotion,
    discipline: j.disciplineScore,
    strategies: j.trades.map(t => t.strategy).join(', ')
  }));

  const prompt = `
    You are a professional trading psychology coach. 
    Analyze the following recent trading journal entries and provide one punchy, actionable tip for improvement.
    Focus on the relationship between emotions, discipline, and results.
    
    Data: ${JSON.stringify(tradesContext)}
    
    Response format: A single short sentence or two that sounds like an expert mentor (Coach T® style).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Focus on the process, not the outcome. The market rewards discipline.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The only constant in trading is change. Stay open and embrace it as a skill!";
  }
};

export const getLiveScannerResults = async (scannerName: string, logic: string[]): Promise<{text: string, sources: any[]}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Search for current financial assets (Crypto or US Stocks) matching this quantitative desk setup: "${scannerName}".
    
    Logic Framework:
    ${logic.join('\n')}

    Additional Strategy Directives (if EMA/RSI):
    - Trend: EMA 20 > SMA 50 > EMA 200 (for Longs) or reverse (for Shorts).
    - Momentum: RSI14 must be > 50 and RSI must be above its own MA14 (for Longs).
    - Entry Zone: Assets currently pulling back to EMA 20 or SMA 50 after a momentum surge.
    
    Task:
    1. Scan real-time market data to find 5-8 major tickers currently fitting this logic.
    2. Format the response as a professional Terminal-style table.
    3. Include Ticker, Current Price, RSI Value, and Setup Quality (A+, A, B).
    
    Return the response as clear Markdown with the table. List verified market sources at the bottom.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "No high-probability setups found matching criteria. Scanning continued...";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources };
  } catch (error) {
    console.error("Scanner Error:", error);
    return { 
      text: "Error connecting to quantitative feed. Check network status.", 
      sources: [] 
    };
  }
};
