
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
    Tu es un coach en psychologie du trading professionnel (Style Coach T®). 
    Analyse ces journaux de trading récents et donne un conseil percutant et actionnable.
    Focus sur l'Or (XAU/USD) et la discipline à l'ouverture de 9:30 EST.
    
    Données: ${JSON.stringify(tradesContext)}
    
    Format: Une seule phrase courte et puissante.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "La discipline à 9:30 définit ta rentabilité sur l'Or.";
  } catch (error) {
    return "Le marché ne punit pas tes erreurs, il punit ton manque de plan.";
  }
};

export const getGoldMacroAnalysis = async (): Promise<{text: string, sources: any[]}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyse fondamentale en temps réel pour l'Or (XAU/USD) avant l'ouverture US (9:30 EST).
    Considère: 
    1. Dollar Index (DXY)
    2. US 10Y Yields
    3. News macro (Inflation, Fed, Emploi)
    4. Sentiment de risque global.
    
    Donne un résumé ultra-concis : "Sentiment: Bullish/Bearish/Neutral" suivi de 3 points clés.
    Identifie les zones de liquidité institutionnelle proches du prix actuel.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return { 
      text: response.text || "Analyse indisponible. Surveillez la volatilité à 9:30.", 
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
    };
  } catch (error) {
    return { text: "Erreur de connexion au flux macro.", sources: [] };
  }
};

export const getLiveScannerResults = async (scannerName: string, logic: string[]): Promise<{text: string, sources: any[]}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Search for current financial assets matching this quantitative desk setup: "${scannerName}".
    Logic: ${logic.join('\n')}
    Return professional Markdown table.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return { 
      text: response.text || "Aucun setup trouvé.", 
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
    };
  } catch (error) {
    return { text: "Erreur scanner.", sources: [] };
  }
};
