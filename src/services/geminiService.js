import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Using gemini-2.0-flash as it is a supported model
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
} else {
    console.warn("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
}

export const getGeminiResponse = async (prompt) => {
    if (!model) {
        return "I'm sorry, but I haven't been configured with an API key yet. Please check your settings.";
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        // Return a more specific error message for debugging if available
        return `I'm having trouble connecting. Error: ${error.message || "Unknown error"}`;
    }
};
