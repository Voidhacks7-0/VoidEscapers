🧠 VitaTrek – Your AI Health Guardian
Predict, Prevent, Personalize — Chronic Disease Management with Agentic AI
🌟 Overview

VitaTrek is an AI-powered web-based chatbot system designed to monitor and predict 8 major chronic diseases through intelligent symptom conversations. It integrates Google Gemini Pro (via API), medical reasoning, and PDF reporting — all through a clean, mobile-friendly interface.

🩺 Diseases Covered:

Alzheimer’s

Chronic Kidney Disease (CKD)

Diabetes

Obesity

Depression

Stress/Anxiety

Heart Disease

Hypertension

✨ Key Features:

Conversational diagnosis using Gemini API

Friendly, responsive chatbot UI (HTML + JS)

AI-generated personalized health advice (yoga, diet, exercise)

Downloadable session-based health PDF report

Offline disease model integration for Alzheimer’s, Skin, Yoga, etc. (optional)

🚀 Project Structure
├── app.py                      # Flask backend (API + PDF)
├── static/
│   ├── style.css              # Chatbot UI styling
│   └── chat.js                # Frontend logic and chatbot client
├── templates/
│   └── index.html             # Main chatbot HTML page
├── models/
│   ├── alzheimer_model.pkl    # [PLACEHOLDER] Alzheimer MRI model
│   ├── yoga_pose_model.pkl    # [PLACEHOLDER] Yoga Pose correction
│   └── skin_model.h5          # [PLACEHOLDER] Skin Disease classifier
├── requirements.txt           # Python dependencies
└── README.md                  # You are here

💬 Chatbot Flow

User types symptoms in natural language.

Gemini API evaluates likely diseases.

Gemini follows up with clarifying questions if needed.

Once confident, it generates:

Diagnosis or risk estimate

Yoga/exercise/diet tips

Friendly lifestyle advice

After conversation ends, user can download a PDF report summarizing:

Symptoms

Predicted disease(s)

Recommendations

Disclaimer: AI-generated, not medical advice

📦 Setup Instructions
1. Clone the Repo
git clone https://github.com/yourusername/vitatrek-ai.git
cd vitatrek-ai

2. Install Python Requirements
pip install -r requirements.txt

3. Get Google Gemini API Key

Visit: https://makersuite.google.com/app

Create an API key.

Set it in your environment:

export GEMINI_API_KEY="your-api-key"

4. Run the Flask App
python app.py


Open your browser at http://localhost:5000

🧠 AI Models

🔗 Add your downloadable/hosted model links below if you deploy additional models:

Alzheimer’s MRI Classifier: [MODEL_LINK_ALZ]

Skin Disease Detection (Image-Based): [MODEL_LINK_SKIN]

Yoga Pose Correction (PoseNet or MediaPipe): [MODEL_LINK_YOGA]

📄 Sample PDF Output

Each session generates a downloadable PDF with:

❗ Symptoms & Disease Risk

🧘 Yoga + Exercise Tips

🥗 Diet Recommendations

⚠️ AI Disclaimer for medical accuracy

🌍 Target Audience

Students & young adults

Rural healthcare users (low internet)

College campuses, NGOs, health tech startups

💡 Why VitaTrek?

Unlike other apps that just track steps and calories, VitaTrek predicts chronic diseases, helps prevent health deterioration, and empowers users with lifestyle coaching — all in a friendly conversation.

📢 Team Void Escaper presents:

VitaTrek — Smart AI for Serious Health.

Built in 24 hours. Designed for millions.