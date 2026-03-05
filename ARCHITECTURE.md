# 🏗️ JARVIS Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React Frontend - Port 3000)                 │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Text Input  │  │ Microphone   │  │ Chat Display │        │
│  │    Field     │  │   Button     │  │   History    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │           Audio Player (HTML5 Audio API)             │     │
│  └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │ (axios)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                            │
│                        (Port 8000)                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    API Endpoints                          │ │
│  │                                                           │ │
│  │  POST /chat          - Text message → Response + Audio   │ │
│  │  POST /voice-chat    - Audio file → Transcription +      │ │
│  │                        Response + Audio                   │ │
│  │  GET  /audio/{file}  - Serve audio files                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                  Processing Pipeline                      │ │
│  │                                                           │ │
│  │  1. speech_to_text.py  → Faster-Whisper                 │ │
│  │  2. llm_engine.py      → Google Gemini API              │ │
│  │  3. text_to_speech.py  → gTTS                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              audio_responses/ Directory                   │ │
│  │         (Generated MP3 files stored here)                 │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  Google Gemini   │         │   Google TTS     │            │
│  │      API         │         │     (gTTS)       │            │
│  │                  │         │                  │            │
│  │  - AI Responses  │         │  - Audio Files   │            │
│  │  - Conversation  │         │  - Natural Voice │            │
│  └──────────────────┘         └──────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Text Chat Flow

```
User Types Message
       │
       ▼
┌─────────────────┐
│ React Frontend  │
│  - Input Field  │
└─────────────────┘
       │
       │ POST /chat
       │ { message: "Hello" }
       ▼
┌─────────────────┐
│ FastAPI Backend │
│  - app.py       │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  llm_engine.py  │
│  - ask_gemini() │
└─────────────────┘
       │
       │ API Call
       ▼
┌─────────────────┐
│  Gemini API     │
│  - Generate     │
│    Response     │
└─────────────────┘
       │
       │ Response Text
       ▼
┌─────────────────┐
│text_to_speech.py│
│  - gTTS         │
│  - Save MP3     │
└─────────────────┘
       │
       │ Audio File Created
       ▼
┌─────────────────┐
│audio_responses/ │
│  response.mp3   │
└─────────────────┘
       │
       │ Return JSON
       │ { response: "...", audio_url: "/audio/..." }
       ▼
┌─────────────────┐
│ React Frontend  │
│  - Display Text │
│  - Play Audio   │
└─────────────────┘
       │
       ▼
   User Hears Response
```

### 2. Voice Chat Flow

```
User Clicks Mic
       │
       ▼
┌─────────────────┐
│ React Frontend  │
│  - MediaRecorder│
│  - Record Audio │
└─────────────────┘
       │
       │ User Speaks
       ▼
┌─────────────────┐
│  Audio Blob     │
│  (WAV format)   │
└─────────────────┘
       │
       │ POST /voice-chat
       │ FormData(audio: blob)
       ▼
┌─────────────────┐
│ FastAPI Backend │
│  - Save temp    │
│    audio file   │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│speech_to_text.py│
│  - Whisper      │
│  - Transcribe   │
└─────────────────┘
       │
       │ Transcribed Text
       ▼
┌─────────────────┐
│  llm_engine.py  │
│  - ask_gemini() │
└─────────────────┘
       │
       │ API Call
       ▼
┌─────────────────┐
│  Gemini API     │
│  - Generate     │
│    Response     │
└─────────────────┘
       │
       │ Response Text
       ▼
┌─────────────────┐
│text_to_speech.py│
│  - gTTS         │
│  - Save MP3     │
└─────────────────┘
       │
       │ Audio File Created
       ▼
┌─────────────────┐
│audio_responses/ │
│  response.mp3   │
└─────────────────┘
       │
       │ Return JSON
       │ { user_message: "...", response: "...", audio_url: "..." }
       ▼
┌─────────────────┐
│ React Frontend  │
│  - Display Both │
│  - Play Audio   │
└─────────────────┘
       │
       ▼
   User Hears Response
```

## Component Breakdown

### Frontend Components (React)

```
App.jsx
├── State Management
│   ├── messages (array)
│   ├── inputText (string)
│   ├── isRecording (boolean)
│   ├── isLoading (boolean)
│   └── currentAudio (Audio object)
│
├── Functions
│   ├── sendMessage()
│   ├── playAudio()
│   ├── startRecording()
│   ├── stopRecording()
│   └── sendVoiceMessage()
│
└── UI Components
    ├── Header
    ├── Messages Container
    │   ├── Welcome Message
    │   ├── User Messages
    │   ├── Assistant Messages
    │   └── Loading Indicator
    └── Input Container
        ├── Text Input
        ├── Mic Button
        └── Send Button
```

### Backend Components (FastAPI)

```
app.py
├── FastAPI App
│   ├── CORS Middleware
│   └── Audio Directory Setup
│
├── Endpoints
│   ├── GET  /
│   ├── POST /chat
│   ├── POST /voice-chat
│   └── GET  /audio/{filename}
│
└── Dependencies
    ├── llm_engine.py
    │   └── ask_gemini()
    ├── speech_to_text.py
    │   ├── listen()
    │   └── transcribe_audio()
    └── text_to_speech.py
        ├── speak()
        └── text_to_speech_file()
```

## Technology Stack

```
┌─────────────────────────────────────────────┐
│              FRONTEND                       │
├─────────────────────────────────────────────┤
│  React 18.3                                 │
│  Vite 5.4                                   │
│  Axios 1.7                                  │
│  Lucide React (Icons)                       │
│  HTML5 Audio API                            │
│  MediaRecorder API                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│              BACKEND                        │
├─────────────────────────────────────────────┤
│  FastAPI 0.115                              │
│  Uvicorn 0.32                               │
│  Python 3.10+                               │
│  Pydantic (Data Validation)                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           AI & AUDIO                        │
├─────────────────────────────────────────────┤
│  Google Gemini API (LLM)                    │
│  Faster-Whisper (STT)                       │
│  gTTS (TTS)                                 │
│  pyttsx3 (Backup TTS)                       │
│  sounddevice (Audio Recording)              │
│  scipy (Audio Processing)                   │
└─────────────────────────────────────────────┘
```

## File Structure with Responsibilities

```
Jarvis/
│
├── backend/
│   ├── app.py                    # Main FastAPI application
│   │                             # - Define endpoints
│   │                             # - Handle requests
│   │                             # - Serve audio files
│   │
│   ├── config.py                 # Configuration
│   │                             # - API keys
│   │                             # - Settings
│   │
│   ├── llm_engine.py             # Gemini Integration
│   │                             # - Initialize model
│   │                             # - Send prompts
│   │                             # - Return responses
│   │
│   ├── speech_to_text.py         # Speech Recognition
│   │                             # - Record audio
│   │                             # - Transcribe with Whisper
│   │                             # - Return text
│   │
│   ├── text_to_speech.py         # Audio Generation
│   │                             # - Generate audio with gTTS
│   │                             # - Save MP3 files
│   │                             # - Fallback to pyttsx3
│   │
│   └── audio_responses/          # Audio Storage
│                                 # - Generated MP3 files
│                                 # - Served via HTTP
│
└── frontend/
    ├── src/
    │   ├── App.jsx               # Main Component
    │   │                         # - Chat interface
    │   │                         # - Voice recording
    │   │                         # - Audio playback
    │   │
    │   ├── App.css               # Styling
    │   │                         # - Chat UI
    │   │                         # - Animations
    │   │                         # - Responsive design
    │   │
    │   ├── main.jsx              # React Entry
    │   │                         # - Initialize React
    │   │                         # - Render App
    │   │
    │   └── index.css             # Global Styles
    │                             # - Body styles
    │                             # - Root container
    │
    ├── index.html                # HTML Template
    │                             # - Root div
    │                             # - Script imports
    │
    ├── package.json              # Dependencies
    │                             # - React packages
    │                             # - Build scripts
    │
    └── vite.config.js            # Vite Config
                                  # - Dev server
                                  # - Build settings
```

## Network Communication

```
Frontend (localhost:3000)
    │
    │ HTTP Requests
    │
    ├─► POST /chat
    │   Request:  { message: "Hello" }
    │   Response: { response: "Hi!", audio_url: "/audio/..." }
    │
    ├─► POST /voice-chat
    │   Request:  FormData(audio: blob)
    │   Response: { user_message: "...", response: "...", audio_url: "..." }
    │
    └─► GET /audio/{filename}
        Request:  GET /audio/response_12345.mp3
        Response: Audio file (audio/mpeg)
    │
    ▼
Backend (localhost:8000)
```

## Security Considerations

```
┌─────────────────────────────────────────────┐
│           SECURITY MEASURES                 │
├─────────────────────────────────────────────┤
│  ✅ CORS configured for specific origins    │
│  ✅ File upload size limits                 │
│  ✅ Audio file validation                   │
│  ✅ Temporary file cleanup                  │
│  ✅ Error handling                          │
│  ⚠️  API key in config (use .env in prod)  │
│  ⚠️  No authentication (add for prod)      │
│  ⚠️  No rate limiting (add for prod)       │
└─────────────────────────────────────────────┘
```

---

**This architecture provides a scalable, maintainable, and user-friendly AI voice assistant system!**
