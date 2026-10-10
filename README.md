
# 💜 FeelMate AI – Emotion-Aware Wellness Companion

FeelMate AI is an AI-powered wellness companion that provides emotion-aware support using Google Gemini AI, facial expression recognition, and personalized recommendations in English and Sinhala.

## ✨ Features

- 🤖 AI-powered emotional support chat using Google Gemini.
- 😊 Facial expression recognition using machine learning.
- 💜 Personalized recommendations based on detected emotions.
- 🌐 English and Sinhala language support.
- 💬 Context-aware conversations with recent chat history.
- 🎨 User-friendly React interface.
- ⚡ FastAPI backend for AI and ML integration.

## 🛠️ Technologies Used

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Python
- FastAPI
- Google Gemini API
- Pillow
- Machine Learning

## 📁 Project Structure

```text
feelmate-ai/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── main.py
│   ├── emotion_model.py
│   ├── recommendations.py
│   ├── requirements.txt
│   └── .env.example
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd feelmate-ai
```

### 2. Set up the backend

Open a terminal:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend:

```bash
python -m uvicorn main:app --reload
```

Backend URL: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key used for AI responses |

Never commit your actual `.env` file or API key to GitHub.

## 🚀 Usage

1. Start the backend and frontend servers.
2. Open the frontend in your browser.
3. Enter a message to chat with FeelMate AI.
4. Choose the supported language.
5. Use facial expression recognition and explore personalized recommendations when available.

## 🛡️ Disclaimer

FeelMate AI is a wellness support tool and is not a substitute for professional medical care, psychological therapy, or emergency services.

## 👩‍💻 Author

Developed as an AI-powered wellness companion project.
