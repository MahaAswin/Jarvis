"""Text-to-Speech module with both live speech and file generation"""

import pyttsx3
from gtts import gTTS
import os

# Initialize pyttsx3 engine once
engine = pyttsx3.init()
engine.setProperty("rate", 170)  # speaking speed
engine.setProperty("volume", 1.0)  # volume level

def speak(text):
    """Speak text immediately using pyttsx3"""
    global engine
    print("Jarvis:", text)
    try:
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"Error in text-to-speech: {e}")
        # Try to reinitialize engine
        try:
            engine = pyttsx3.init()
            engine.setProperty("rate", 170)
            engine.say(text)
            engine.runAndWait()
        except:
            print("Failed to speak text")

def text_to_speech_file(text, output_path):
    """
    Convert text to speech and save as audio file
    Uses gTTS for better quality audio files
    """
    try:
        # Use gTTS for file generation (better quality)
        tts = gTTS(text=text, lang='en', slow=False)
        tts.save(output_path)
        print(f"Audio saved to: {output_path}")
        return output_path
    except Exception as e:
        print(f"Error generating audio file: {e}")
        # Fallback to pyttsx3
        try:
            engine.save_to_file(text, output_path)
            engine.runAndWait()
            return output_path
        except Exception as e2:
            print(f"Fallback also failed: {e2}")
            return None
