# JARVIS - AI Voice Assistant

A full-stack AI voice assistant with speech recognition, natural language processing using Google Gemini, and text-to-speech capabilities.

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
FastAPI Backend
    ↓
Google Gemini API
    ↓
Text-to-Speech (gTTS/pyttsx3)
```

## 📁 Project Structure

```
Jarvis/
│
├── backend/
│   ├── app.py                 # FastAPI application
│   ├── config.py              # Configuration (API keys)
│   ├── llm_engine.py          # Gemini integration
│   ├── speech_to_text.py      # Faster-Whisper STT
│   ├── text_to_speech.py      # TTS with gTTS and pyttsx3
│   ├── requirements.txt       # Python dependencies
│   └── audio_responses/       # Generated audio files (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── App.css           # Styling
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── index.html            # HTML template
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
│
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Microphone access
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure API key:**
Edit `config.py` and add your Gemini API key:
```python
GEMINI_API_KEY = "your-api-key-here"
```

Get your API key from: https://makersuite.google.com/app/apikey

5. **Run the backend server:**
```bash
python app.py
```

Backend will run on: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the development server:**
```bash
npm run dev
```

Frontend will run on: `http://localhost:3000`

## 🎯 Usage

### Using the Web Interface

1. **Text Chat:**
   - Type your message in the input box
   - Click the send button or press Enter
   - Jarvis will respond with text and voice

2. **Voice Chat:**
   - Click the microphone button
   - Speak your message
   - Click the microphone button again to stop recording
   - Jarvis will transcribe, process, and respond with voice

3. **Replay Audio:**
   - Click the speaker icon on any assistant message to replay the audio

### API Endpoints

#### POST `/chat`
Send text message and receive text + audio response

**Request:**
```json
{
  "message": "Hello Jarvis"
}
```

**Response:**
```json
{
  "response": "Hello! How can I help you?",
  "audio_url": "/audio/response_12345.mp3"
}
```

#### POST `/voice-chat`
Upload audio file and receive transcription + response

**Request:**
- Form data with audio file

**Response:**
```json
{
  "user_message": "What is AI?",
  "response": "AI stands for Artificial Intelligence...",
  "audio_url": "/audio/response_67890.mp3"
}
```

#### GET `/audio/{filename}`
Retrieve audio file

## 🔧 Features

✅ Real-time voice recording from browser  
✅ Speech-to-text using Faster-Whisper  
✅ Natural language processing with Google Gemini  
✅ Text-to-speech with gTTS (high quality)  
✅ Modern ChatGPT-like UI  
✅ Conversation history display  
✅ Auto-play audio responses  
✅ Replay audio functionality  
✅ Responsive design  
✅ Loading states and animations  

## 🐛 Troubleshooting

### Backend Issues

**Problem: pyttsx3 not speaking**
- Solution: The system now uses gTTS for file generation which is more reliable
- Audio files are saved and served via HTTP

**Problem: Faster-Whisper CUDA error**
- Solution: Change device to "cpu" in `speech_to_text.py`:
```python
model = WhisperModel("base", device="cpu", compute_type="int8")
```

**Problem: Gemini API error**
- Check your API key in `config.py`
- Verify internet connection
- Check API quota at Google AI Studio

### Frontend Issues

**Problem: Microphone not working**
- Grant microphone permissions in browser
- Use HTTPS or localhost (required for microphone access)
- Check browser console for errors

**Problem: Audio not playing**
- Check browser audio permissions
- Verify backend is running
- Check network tab for audio file requests

**Problem: CORS errors**
- Ensure backend is running on port 8000
- Check CORS middleware in `app.py`

## 🎨 Customization

### Change Voice Speed
Edit `backend/text_to_speech.py`:
```python
engine.setProperty("rate", 170)  # Adjust speed (default: 170)
```

### Change Gemini Model
Edit `backend/llm_engine.py`:
```python
model = genai.GenerativeModel("models/gemini-2.5-flash")  # or gemini-pro
```

### Change UI Colors
Edit `frontend/src/App.css` and `frontend/src/index.css`

### Change Whisper Model
Edit `backend/speech_to_text.py`:
```python
model = WhisperModel("base")  # Options: tiny, base, small, medium, large
```

## 📝 Development

### Run Backend in Development Mode
```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

### Test API Endpoints
```bash
# Test chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

## 🔐 Security Notes

- Never commit API keys to version control
- Use environment variables for production
- Implement rate limiting for production use
- Add authentication for public deployment

## 📄 License

MIT License - Feel free to use and modify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using React, FastAPI, and Google Gemini**
