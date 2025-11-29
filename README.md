# 🧠 VitaTrek – Your AI Health Guardian

> **Predict, Prevent, Personalize — Chronic Disease Management with Agentic AI**

## 🌟 Overview

**VitaTrek** is an AI-powered web-based chatbot system designed to monitor and predict 8 major chronic diseases through intelligent symptom conversations. It integrates Google Gemini Pro (via API), medical reasoning, and PDF reporting — all through a clean, mobile-friendly interface.

### 🩺 Diseases Covered:
-   Alzheimer’s
-   Chronic Kidney Disease (CKD)
-   Diabetes
-   Obesity
-   Depression
-   Stress/Anxiety
-   Heart Disease
-   Hypertension

## 🌐 Live Demos

Experience the application and its specialized models:

-   **🚀 Main Application**: [VoidEscapers App](https://voidescapers-b0wsi9lbn-lakshyas-projects-7cc2d5e3.vercel.app/)
-   **🧠 Alzheimer Detection**: [Alzheimer Model](https://alzhimer112233.netlify.app/)
-   **🧘 Yoga Pose Detection**: [Yoga Pose App](https://yogapose112233.netlify.app/)
-   **🧴 Skin Disease Detection**: [Skin Disease App](https://skinddisease112233.netlify.app/)
-   **📋 Report Analyzer**: [Health Report Analyzer](https://reportanalyzer223344.netlify.app/)

## ✨ Key Features

-   **Conversational Diagnosis**: Uses Gemini API for intelligent symptom analysis.
-   **Friendly Chatbot UI**: Responsive and accessible interface.
-   **Personalized Advice**: AI-generated recommendations for yoga, diet, and exercise.
-   **Health Reports**: Downloadable session-based PDF reports.
-   **Offline Integration**: Support for specialized disease models (Alzheimer’s, Skin, Yoga).

## 💬 Chatbot Flow

1.  **User Input**: User types symptoms in natural language.
2.  **AI Analysis**: Gemini API evaluates likely diseases.
3.  **Follow-up**: Gemini asks clarifying questions if needed.
4.  **Results**: Once confident, it generates a diagnosis or risk estimate.
5.  **Recommendations**: Provides yoga, exercise, and diet tips.
6.  **Report**: User can download a PDF summarizing symptoms, predictions, and advice.

> **Disclaimer**: AI-generated content is for informational purposes only and is not medical advice.

## 🚀 Project Structure

This project is built with **React + Vite** for the frontend and uses **Firebase** for authentication and backend services.

```
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Main application pages (Dashboard, Diet, Consult, etc.)
│   ├── context/           # React Context (Auth, etc.)
│   ├── firebase.js        # Firebase configuration
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Entry point
├── public/                # Static assets
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
└── vite.config.js         # Vite configuration
```

## 📦 Setup Instructions

Follow these steps to set up the project locally.

### 1. Clone the Repo
```bash
git clone https://github.com/yourusername/vitatrek-ai.git
cd vitatrek-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env` file in the root directory and add your Firebase and Gemini API keys:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
# ... other config
```

### 4. Run the Application
```bash
npm run dev
```
Open your browser at `http://localhost:5173`

## 🧠 AI Models

We integrate specialized models for enhanced diagnostics:

-   **Alzheimer’s MRI Classifier**: [Link](https://alzhimer112233.netlify.app/)
-   **Skin Disease Detection**: [Link](https://skinddisease112233.netlify.app/)
-   **Yoga Pose Correction**: [Link](https://yogapose112233.netlify.app/)
-   **Health Report Analyzer**: [Link](https://reportanalyzer223344.netlify.app/)

## 📄 Sample PDF Output

Each session generates a downloadable PDF with:
-   ❗ Symptoms & Disease Risk
-   🧘 Yoga + Exercise Tips
-   🥗 Diet Recommendations
-   ⚠️ AI Disclaimer for medical accuracy

## 🌍 Target Audience

-   Students & young adults
-   Rural healthcare users (low internet connectivity)
-   College campuses, NGOs, health tech startups

## 💡 Why VitaTrek?

Unlike other apps that just track steps and calories, **VitaTrek** predicts chronic diseases, helps prevent health deterioration, and empowers users with lifestyle coaching — all in a friendly conversation.

---

### 📢 Team Void Escaper presents:

**VitaTrek — Smart AI for Serious Health.**

*Built in 24 hours. Designed for millions.*
