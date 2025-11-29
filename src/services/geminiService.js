import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Using gemini-2.0-flash as it is a supported model
    model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "You are Vita, a professional Health Assistant. Your goal is to provide accurate, medical, and health-related advice. \n\nRULES:\n1. Keep responses STRICTLY under 50 words.\n2. Be specific (e.g., name exact yoga poses or books) but extremely concise.\n3. Use bullet points if possible to save space.\n4. If an image is provided, give a quick 1-sentence analysis.\n5. Maintain a professional, clinical, yet helpful tone."
    });
} else {
    console.warn("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
}

export const getGeminiResponse = async (currentMessage, history = [], imageBase64 = null) => {
    if (!model) {
        return "I'm sorry, but I haven't been configured with an API key yet. Please check your settings.";
    }

    try {
        // 1. Format History
        const historyText = history.map(msg =>
            `${msg.sender === 'me' ? 'User' : 'Vita'}: ${msg.text}`
        ).join('\n');

        // 2. Construct Text Prompt
        const fullPrompt = `Previous Conversation:\n${historyText}\n\nCurrent User Message: ${currentMessage}`;

        // 3. Prepare Request Parts
        const parts = [{ text: fullPrompt }];

        // 4. Add Image if present
        if (imageBase64) {
            // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
            const base64Data = imageBase64.split(',')[1];
            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg" // Assuming JPEG for simplicity, or detect from string
                }
            });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return `I'm having trouble connecting. Error: ${error.message || "Unknown error"}`;
    }
};
