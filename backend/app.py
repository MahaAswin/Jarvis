"""FastAPI Backend for Jarvis Voice Assistant"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import os
import tempfile
from pathlib import Path

from llm_engine import ask_gemini
from text_to_speech import text_to_speech_file
from speech_to_text import transcribe_audio

app = FastAPI(title="Jarvis Voice Assistant API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create audio directory if it doesn't exist
AUDIO_DIR = Path("audio_responses")
AUDIO_DIR.mkdir(exist_ok=True)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    audio_url: str

@app.get("/")
def read_root():
    return {"message": "Jarvis Voice Assistant API is running"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Accept text message, send to Gemini, return text response and audio URL
    """
    try:
        # Get response from Gemini
        response_text = ask_gemini(request.message)
        
        # Generate audio file
        audio_filename = f"response_{hash(response_text)}.mp3"
        audio_path = AUDIO_DIR / audio_filename
        
        # Convert text to speech and save
        text_to_speech_file(response_text, str(audio_path))
        
        return ChatResponse(
            response=response_text,
            audio_url=f"/audio/{audio_filename}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voice-chat")
async def voice_chat(audio: UploadFile = File(...)):
    """
    Accept audio file, transcribe it, send to Gemini, return text and audio response
    """
    try:
        # Save uploaded audio temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        
        # Transcribe audio to text
        user_text = transcribe_audio(temp_audio_path)
        
        # Clean up temp file
        os.unlink(temp_audio_path)
        
        if not user_text:
            raise HTTPException(status_code=400, detail="Could not transcribe audio")
        
        # Get response from Gemini
        response_text = ask_gemini(user_text)
        
        # Generate audio file
        audio_filename = f"response_{hash(response_text)}.mp3"
        audio_path = AUDIO_DIR / audio_filename
        
        # Convert text to speech and save
        text_to_speech_file(response_text, str(audio_path))
        
        return {
            "user_message": user_text,
            "response": response_text,
            "audio_url": f"/audio/{audio_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    """
    Serve audio files
    """
    audio_path = AUDIO_DIR / filename
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(audio_path, media_type="audio/mpeg")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
