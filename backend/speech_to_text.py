"""Speech-to-Text module using Faster-Whisper"""

import sounddevice as sd
from scipy.io.wavfile import write
from faster_whisper import WhisperModel

# Initialize Whisper model once
model = WhisperModel("base", device="cpu", compute_type="int8")

def listen():
    """Record audio from microphone and transcribe"""
    fs = 16000
    seconds = 6

    print("Listening...")

    recording = sd.rec(int(seconds * fs), samplerate=fs, channels=1)
    sd.wait()

    write("input.wav", fs, recording)

    segments, info = model.transcribe(
        "input.wav",
        beam_size=5
    )

    text = ""
    for segment in segments:
        text += segment.text

    print("You said:", text)
    return text

def transcribe_audio(audio_path):
    """Transcribe audio file to text"""
    try:
        segments, info = model.transcribe(
            audio_path,
            beam_size=5
        )

        text = ""
        for segment in segments:
            text += segment.text

        print("Transcribed:", text)
        return text.strip()
    except Exception as e:
        print(f"Transcription error: {e}")
        return None
