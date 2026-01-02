
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// High Traffic Optimization: Persistent & In-memory Cache
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 Hours
const COOLDOWN_PERIOD = 1000 * 60 * 5; // 5 minutes cooldown on 429 errors
const LOCAL_CACHE_KEY = 'seoul_muse_ai_cache';

let last429Timestamp = 0;
let requestQueue: Promise<any> = Promise.resolve();

const getPersistentCache = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

const setPersistentCache = (key: string, data: string) => {
  try {
    const cache = getPersistentCache();
    cache[key] = { data, timestamp: Date.now() };
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Cache write failed (Quota/Privacy):", e);
  }
};

/**
 * Generic wrapper for Gemini calls with serialized queue, persistent caching, and circuit breaking.
 */
const withOptimizedAI = async (cacheKey: string, prompt: string, config: any = {}): Promise<string> => {
  const now = Date.now();

  // 1. Check Circuit Breaker (Quota Cooldown)
  if (now - last429Timestamp < COOLDOWN_PERIOD) {
    return ""; 
  }

  // 2. Check Persistent Cache
  const cache = getPersistentCache();
  if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_TTL)) {
    return cache[cacheKey].data;
  }

  // 3. Serialize Requests (Queue) to prevent concurrent 429s
  return new Promise((resolve) => {
    requestQueue = requestQueue.then(async () => {
      try {
        const response = await ai.models.generateContent({
          ...config,
          contents: prompt,
        });
        const result = String(response.text || "");
        if (result) {
          setPersistentCache(cacheKey, result);
          resolve(result);
        } else {
          resolve("");
        }
      } catch (error: any) {
        const errorMsg = error?.message || "";
        if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
          console.warn("Gemini Quota Reached. Using fallback logic.");
          last429Timestamp = Date.now();
        }
        resolve("");
      }
    });
  });
};

export const getDashboardInsight = async (stats: any) => {
  const cacheKey = `dashboard_v2_${stats.totalRevenue}_${stats.totalOrders}`;
  const prompt = `Sales: $${stats.totalRevenue}, Orders: ${stats.totalOrders}. 
  Analyze performance and predict the next "premium" K-fashion trend. 
  3 bullet points. Luxury tone. Under 40 words total.`;

  const result = await withOptimizedAI(cacheKey, prompt, {
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are a senior fashion director in Seoul.",
    }
  });
  return result || getDefaultInsight();
};

const getDefaultInsight = () => `• Anticipating a surge in architectural minimalism across Cheongdam-dong.
• Seasonal pivot: Shift toward semi-sheer industrial textiles is accelerating.
• Market trajectory remains bullish for sustainable luxury co-ords.`;

export const getTrendRadar = async () => {
  const cacheKey = "trend_radar_v2";
  const prompt = `1-sentence "Haute Couture Alert" from Seoul today. Sophisticated, under 15 words. Mention a specific district.`;
  
  const result = await withOptimizedAI(cacheKey, prompt, {
    model: "gemini-3-flash-preview"
  });
  return result || "The architectural minimalism of Hannam-dong defines the current season.";
};

export const getSearchCuration = async (query: string) => {
  const cacheKey = `search_v2_${query.toLowerCase().trim()}`;
  const prompt = `The user is searching for: "${query}". Brief editorial stylist recommendation. Under 20 words.`;
  
  const result = await withOptimizedAI(cacheKey, prompt, {
    model: "gemini-3-flash-preview"
  });
  return result || "Curating a selection of architectural silhouettes tailored to your aesthetic inquiry.";
};

export const getFashionAdvice = async (productName: string) => {
  const cacheKey = `advice_v2_${productName}`;
  const prompt = `Styling Protocol for: "${productName}". 
  CONCEPT: [1 word]
  EQUIPMENT: [1 accessory]
  DESTINATION: [1 Seoul location]`;
  
  const result = await withOptimizedAI(cacheKey, prompt, {
    model: "gemini-3-flash-preview"
  });
  return result || "CONCEPT: Romantic | EQUIPMENT: Silk Scarf | DESTINATION: Afternoon tea in Seongsu";
};

export const generateProductDescription = async (productName: string, category: string) => {
  const cacheKey = `desc_v2_${productName}`;
  const prompt = `Premium description for "${productName}" (${category}). Seoul-Aesthetic. Under 30 words.`;
  
  const result = await withOptimizedAI(cacheKey, prompt, {
    model: "gemini-3-flash-preview"
  });
  return result || "Refined silhouettes meet artisanal craftsmanship. A cornerstone for the contemporary Seoul wardrobe.";
};

export const runLabExperiment = async (prompt: string, track: string) => {
  const cacheKey = `lab_v2_${track}_${prompt.toLowerCase().trim()}`;
  const fullPrompt = `Act as an avant-garde experimental K-fashion design architect. 
  CONCEPT INPUT: "${prompt}"
  EXPERIMENTAL TRACK: "${track.toUpperCase()}"
  Provide a highly technical, high-fashion synthesis under 60 words.`;

  const result = await withOptimizedAI(cacheKey, fullPrompt, {
    model: "gemini-3-flash-preview", // Switched to Flash for better stability under quota limits
    config: { thinkingConfig: { thinkingBudget: 0 } }
  });

  return result || "Synthesis failed: Neural core at capacity. Try a different concept.";
};
