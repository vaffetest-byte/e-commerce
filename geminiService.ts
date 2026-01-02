
import { GoogleGenAI } from "@google/genai";

// Always initialize with the direct process.env.API_KEY object as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDashboardInsight = async (stats: any) => {
  try {
    // Trend forecasting is a complex task requiring high-quality reasoning, thus using gemini-3-pro-preview
    const prompt = `Sales: $${stats.totalRevenue}, Orders: ${stats.totalOrders}.
    Analyze performance and predict the next "premium" K-fashion trend.
    Provide 3 sophisticated, data-driven bullet points. Keep it professional and luxury-toned.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "Act as a senior high-fashion trend forecaster for a luxury boutique in Seoul.",
      }
    });
    return String(response.text || "Optimizing Seoul's market velocity...");
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Analyzing market shift in the Seongsu-dong district...";
  }
};

export const getTrendRadar = async () => {
  try {
    const prompt = `Provide a 1-sentence "Haute Couture Alert" from the Seoul fashion scene today. Use sophisticated vocabulary. Under 15 words. Mention a specific district like Seongsu, Hannam, or Cheongdam.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return String(response.text || "The Hannam-dong silhouette is gravitating toward architectural draping.");
  } catch {
    return "The architectural minimalism of Hannam-dong defines the current season.";
  }
};

export const getFashionAdvice = async (productName: string) => {
  try {
    const prompt = `Create a "Curated Styling Protocol" for: "${productName}". 
    Format:
    CONCEPT: [1 word]
    EQUIPMENT: [1 accessory]
    DESTINATION: [1 specific Seoul location/activity]
    Keep it elegant and brief.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a celebrity head-stylist in Cheongdam-dong, Seoul.",
      }
    });
    return String(response.text || "CONCEPT: Avant-Garde | EQUIPMENT: Silver Choker | DESTINATION: Gallery opening in Samcheong-dong");
  } catch (error) {
    return "CONCEPT: Romantic | EQUIPMENT: Silk Scarf | DESTINATION: Afternoon tea in Seongsu";
  }
};

export const generateProductDescription = async (productName: string, category: string) => {
  try {
    const prompt = `Write a premium, editorial-style product description for a designer fashion item: "${productName}" (${category}). 
    Tone: Sophisticated, Minimalist, Seoul-Aesthetic. Include 2-3 brief quality highlights. Under 50 words.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return String(response.text || "A masterclass in structural elegance. Crafted with precision for the modern Muse.");
  } catch (error) {
    return "Refined silhouettes meet artisanal craftsmanship. A cornerstone for the contemporary Seoul wardrobe.";
  }
};
