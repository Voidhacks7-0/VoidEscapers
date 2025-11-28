import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key provided by user
const API_KEY = 'AIzaSyBKnAuySubi-OA6J3dfz3GIgGdEwlvZcMc';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

export const generateChatResponse = async (message: string, context?: string) => {
    try {
        const prompt = context
            ? `Context: ${context}\n\nUser: ${message}\n\nProvide a helpful, motivational response as a health assistant.`
            : `User: ${message}\n\nProvide a helpful, motivational response as a health assistant.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Chat Error:', error);
        return "I'm having trouble connecting right now. Please try again later.";
    }
};

export const generateReportSummary = async (healthData: any[]) => {
    try {
        const dataStr = JSON.stringify(healthData);
        const prompt = `Analyze the following health data for the last 30 days and provide a 1-page summary report. Include trends, potential risks, and recommendations. Keep it professional but easy to understand.\n\nData: ${dataStr}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Report Error:', error);
        return "Could not generate report at this time.";
    }
};
