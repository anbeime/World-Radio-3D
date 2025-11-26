import { GoogleGenAI } from "@google/genai";

export const fetchCulturalInsight = async (countryName: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured for cultural insights.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Tell me a fascinating, brief (under 60 words) cultural fact about the music scene or radio history of ${countryName}. Keep it engaging and casual.`,
    });

    return response.text || `Enjoy the music from ${countryName}!`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Discover the sounds of ${countryName}.`;
  }
};
