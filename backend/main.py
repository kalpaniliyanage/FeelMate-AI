
import os
import asyncio
from google import genai
from io import BytesIO
from typing import Literal
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from PIL import Image, UnidentifiedImageError
from google import genai


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
- Give advice related to the user's actual circumstances.
- Never assume facts the user has not told you.
- Avoid repetitive generic responses such as "Everything will be okay."
- Sound kind, respectful, and non-judgmental.
- Keep replies concise but meaningful, usually 3-6 sentences.
- Match the requested language.

LANGUAGE:
- If language is "si", respond naturally in Sinhala script.
- If language is "en", respond in English.
- If the user clearly writes in another language, you may match it.

WELLBEING AND SAFETY:
- You are a supportive wellness companion, not a doctor or therapist.
- Do not diagnose mental health conditions.
- Do not shame, judge, pressure, or manipulate the user.
- If the user indicates immediate danger or possible self-harm,
  respond with empathy and encourage them to contact a trusted person
  and local emergency/crisis support now.
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

    # Keep only the latest messages for conversation context.
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

Respond directly to the user's actual situation.
Use the conversation history when relevant.
Do not give a generic, prewritten mood response.
"""

    
    try:
        client = genai.Client(api_key=api_key)
        response = None

        for attempt in range(3):
            try:
                response = client.interactions.create(
                    model="gemini-3.8-flash",
                    input=prompt,
                    system_instruction=SYSTEM_PROMPT,
                    generation_config={
                        "thinking_level": "low",
                    },
                )
                break

            except Exception as exc:
                error_text = str(exc)

                temporary_error = (
                    "503" in error_text
                    or "UNAVAILABLE" in error_text
                    or "429" in error_text
                    or "RESOURCE_EXHAUSTED" in error_text
                )

                if temporary_error and attempt < 2:
                    wait_seconds = 2 ** (attempt + 1)
                    print(
                        f"Gemini temporarily unavailable. "
                        f"Retrying in {wait_seconds}s..."
                    )
                    await asyncio.sleep(wait_seconds)
                else:
                    raise

        if response is None:
            raise RuntimeError("Gemini returned no response.")

        reply = (response.output_text or "").strip()

        if not reply:
            raise RuntimeError("Gemini returned an empty response.")

        return {"reply": reply}

    except HTTPException:
        raise

    except Exception as exc:
        print("AI chat error:", repr(exc))
        raise HTTPException(
            status_code=502,
            detail=(
                "FeelMate could not get an AI response. "
                "Check the Gemini model, API key, and API access."
            ),
        ) 