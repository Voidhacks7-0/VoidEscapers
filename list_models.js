import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCceipix-u2Nd4Sx8PpzWiEP0TEyIEKVaY";

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        // There isn't a direct listModels method on the client instance in the JS SDK usually exposed this simply,
        // but we can try to infer or just test 'gemini-pro'.
        // Actually, the error message suggested calling ListModels. 
        // The JS SDK might not expose listModels directly on the main class easily in older versions, 
        // but let's try to just run a simple generation with 'gemini-pro' to see if it works, 
        // as that is the standard fallback.

        // However, to strictly follow "list models", we can try to hit the REST API directly if the SDK doesn't make it obvious.
        // Let's try a fetch to the API endpoint.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
