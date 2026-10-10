
import os
from io import BytesIO
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from PIL import Image, UnidentifiedImageError
from google import genai
from google.genai import types

from emotion_model import predict_expression
from recommendations import get_recommendations

load_dotenv()

app = FastAPI(title="FeelMate AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatHistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=3000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=3000)
    language: Literal["en", "si"] = "en"
    history: list[ChatHistoryItem] = Field(default_factory=list)


SYSTEM_PROMPT = """
You are FeelMate, a warm, thoughtful, empathetic AI wellness companion.

YOUR MAIN JOB:
- Understand the user's actual problem before responding.
- Answer the specific situation they described, not just the emotion keyword.
- Acknowledge the details they shared and explain why their feelings may make sense.
- Offer 1-3 realistic, gentle, practical next steps relevant to their situation.
- When helpful, ask one natural follow-up question.
- Remember and use the recent conversation history.
- If the user asks for advice, give advice related to their actual circumstances.
- Never assume facts the user has not told you.
- Avoid repetitive generic responses such as "Everything will be okay."
- Sound like a kind, respectful, non-judgmental person, not a scripted chatbot.
- Keep replies concise but meaningful, usually 3-6 sentences.
- Match the language requested by the user.

LANGUAGE:
- If language is "si", respond naturally in Sinhala script.
- If language is "en", respond in English.
- If the user clearly writes in another language, you may match it.

WELLBEING AND SAFETY:
- You are a supportive wellness companion, not a doctor or therapist.
- Do not diagnose mental health conditions or claim certainty about someone's feelings.
- Do not shame, judge, pressure, or manipulate the user.
- If the user indicates immediate danger or possible self-harm, respond with empathy,
  encourage them to contact a trusted person and local emergency/crisis support now.
- Never present yourself as a replacement for professional help.
- Respect privacy and do not ask for unnecessary identifying information.
"""


@app.get("/")
def home():
    return {
        "name": "FeelMate AI",
        "status": "running",
        "chat": "available",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type not in (
        "image/jpeg",
        "image/png",
        "image/webp",
    ):
        raise HTTPException(
            status_code=415,
            detail="Upload a JPG, PNG, or WEBP image.",
        )

    raw = await file.read()

    if len(raw) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image must be smaller than 5 MB.",
        )

    try:
        image = Image.open(BytesIO(raw)).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=400,
            detail="Invalid image file.",
        )

    try:
        prediction = predict_expression(image)
        recommendations = get_recommendations(
            prediction["expression"]
        )
    except Exception as exc:
        print("Prediction error:", repr(exc))
        raise HTTPException(
            status_code=503,
            detail="The ML model failed. Check backend logs.",
        )

    return {
        "prediction": prediction,
        "recommendations": recommendations,
    }


@app.post("/chat")
async def chat(request: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI chat is not configured. "
                "Add GEMINI_API_KEY to the backend .env file."
            ),
        )

    user_message = request.message.strip()

    if not user_message:
        raise HTTPException(
            status_code=400,
            detail="Please enter a message.",
        )

    # Keep only recent messages to maintain useful context.
    recent_history = request.history[-8:]

    transcript = []
    for item in recent_history:
        role = "User" if item.role == "user" else "FeelMate"
        safe_content = item.content[:3000]
        transcript.append(f"{role}: {safe_content}")

    history_text = "\n".join(transcript)

    language_name = (
        "Sinhala (සිංහල අකුරු භාවිත කරන්න)"
        if request.language == "si"
        else "English"
    )

    prompt = f"""
Reply in: {language_name}

Recent conversation:
{history_text if history_text else "(No previous conversation)"}

User's latest message:
{user_message}

Respond directly to the user's actual situation. Do not give a generic,
prewritten mood response. Use the conversation history when relevant.
"""

    try:
        client = genai.Client(api_key=api_key)

        
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.75,
                max_output_tokens=700,
            ),
        )

        reply = (response.text or "").strip()

        if not reply:
            raise ValueError("The AI returned an empty response.")

        return {"reply": reply}

    except HTTPException:
        raise
    except Exception as exc:
        print("AI chat error:", repr(exc))
        raise HTTPException(
            status_code=502,
            detail=(
                "FeelMate could not get an AI response. "
                "Check the API key, internet connection, and backend logs."
            ),
        ) 