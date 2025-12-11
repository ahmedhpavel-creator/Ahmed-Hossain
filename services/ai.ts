import { GoogleGenAI } from "@google/genai";
import { ORGANIZATION_INFO } from "../constants";
import { storage } from "./storage";
import { Event } from "../types";

const getApiKey = () => {
  try {
    // @ts-ignore
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Generates a response for the Chatbot using Gemini 3 Pro Preview.
 */
export const generateChatResponse = async (userMessage: string, history: {id?: string, role: string, text: string}[]) => {
  if (!ai) return "I am currently unavailable due to system configuration (API Key missing). Please contact the office directly.";

  try {
    // 1. Gather Context
    const settings = await storage.getAppSettings(); 
    const contactPhone = settings.contactPhone;
    
    const leaders = await storage.getLeaders();
    const leaderContext = leaders
      .sort((a, b) => a.order - b.order)
      .slice(0, 5) // Top 5 leaders
      .map(l => `${l.name?.en} (${l.designation?.en})`)
      .join(', ');
    
    const events = await storage.getEvents();
    const eventContext = events
      .slice(0, 3)
      .map(e => `${e.title?.en} on ${e.date}`)
      .join('; ');
    
    const contactInfo = `Phone: ${contactPhone}, Email: ${ORGANIZATION_INFO.contact.email}, Address: ${ORGANIZATION_INFO.address}`;

    // 2. System Instruction for Azadi Support
    const systemInstruction = `
      You are "Azadi Support", the dedicated AI assistant for "${ORGANIZATION_INFO.name.en}" (${ORGANIZATION_INFO.name.bn}).
      Your mission is to assist members, donors, and the community with information about our social welfare activities, events, and donation process.

      **Organization Info:**
      - Established: ${ORGANIZATION_INFO.estDate.en}
      - Slogan: ${ORGANIZATION_INFO.slogan.en}
      - Contact: ${contactInfo}
      - Key Leaders: ${leaderContext}
      - Recent Events: ${eventContext || "Check our events page for updates."}

      **Guidelines:**
      1. **Islamic Etiquette:** Start conversations with "Assalamu Alaikum" and maintain a respectful, humble tone (Adab). Use phrases like "InshaAllah" for future hopes and "JazakAllah Khair" for thanks.
      2. **Donations:** If asked about donating, warmly encourage it as a noble deed (Sadaqah). Provide the contact number (${contactPhone}) for Bkash/Nagad/Cash details.
      3. **Language:** Respond in the language the user uses (English or Bangla).
      4. **Scope:** Answer questions strictly related to the organization's welfare activities (Education, Unity, Peace, Service, Sports). If unsure, kindly ask them to call the office.
      
      **Persona:** Helpful, warm, professional, and spiritually conscious.
    `;

    // 3. Prepare History
    const safeHistory = Array.isArray(history) ? history : [];
    // Filter out internal/system messages or connection errors from history context
    const conversationHistory = safeHistory
      .filter(msg => msg.id !== 'welcome' && msg.role && msg.text && !msg.text.includes("unavailable"))
      .map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

    // Add current message
    const contents = [
      ...conversationHistory.slice(-10), // Limit context window
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I apologize, I could not generate a response.";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "I am currently experiencing connection difficulties. Please try again in a moment.";
  }
};

/**
 * Generates a social media summary for an event.
 */
export const generateEventSummary = async (event: Event) => {
  if (!ai) return "AI Service Unavailable";

  try {
    const prompt = `
      As the social media manager for Azadi Social Welfare Organization, write a compelling post for this event:
      
      Title: ${event.title?.en}
      Date: ${event.date}
      Details: ${event.description?.en}
      
      Output: Provide an English version and a Bangla version suitable for Facebook. Use emojis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "Summary generation failed.";
  } catch (error) {
    console.error("Summary Error:", error);
    return "Failed to generate summary.";
  }
};

/**
 * Auto-translates content between English and Bangla
 */
export const autoTranslate = async (text: string, targetLang: 'en' | 'bn'): Promise<string> => {
  if (!text || !ai) return text;
  
  try {
    const prompt = `Translate this text to ${targetLang === 'en' ? 'English' : 'Bengali'}. Keep the tone respectful and accurate. Text: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (e) {
    return text;
  }
};

export const smartFormat = async (text: string, type: 'name' | 'phone' | 'text'): Promise<string> => {
    if (!text) return "";
    if (type === 'phone') return text.replace(/[^0-9+]/g, '');
    if (type === 'name') return text.replace(/\b\w/g, c => c.toUpperCase());
    return text;
};
