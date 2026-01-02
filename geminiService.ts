
import { GoogleGenAI } from "@google/genai";

// Utility to get a fresh AI instance with current environment variables
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDashboardInsight = async (stats: any) => {
  try {
    const ai = getAI();
    const prompt = `Act as a senior trend forecaster for "Seoul Muse". 
    Sales: $${stats.totalRevenue}, Orders: ${stats.totalOrders}.
    Analyze performance and predict the next "viral" K-fashion trend.
    Provide 3 punchy, data-driven bullet points for the business owner.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Optimizing market strategy based on current demand...";
  }
};

export const getTrendRadar = async () => {
  try {
    const ai = getAI();
    const prompt = `Provide a 1-sentence "Hot Trend Alert" from the Seoul fashion scene today. Keep it under 20 words and high-energy.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch {
    return "Ribbon-core is taking over the streets of Hongdae!";
  }
};

export const getFashionAdvice = async (productName: string) => {
  try {
    const ai = getAI();
    const prompt = `You are a celebrity stylist in Seoul. Create a "Lookbook Entry" for: "${productName}". 
    Include:
    1. The "Vibe" (1 word)
    2. "Pair with" (1 item)
    3. "Occasion" (e.g. Cafe hopping in Seongsu).
    Keep it extremely brief and aesthetic.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Vibe: Romantic | Pair with: Pearl Earrings | Occasion: Seoul Cafe Hopping";
  }
};

export const generateProductDescription = async (productName: string, category: string) => {
  try {
    const ai = getAI();
    const prompt = `Write a premium, aesthetic product description for a fashion item named "${productName}" in the category "${category}". 
    Focus on K-fashion aesthetics. Include 3 bullet points about quality and style. Keep it under 60 words.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "This limited-edition piece captures the essence of Seoul's modern street-style. Crafted for those who lead the trend.";
  }
};
