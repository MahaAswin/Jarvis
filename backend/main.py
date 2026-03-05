from speech_to_text import listen
from llm_engine import ask_gemini
from text_to_speech import speak

def main():

    speak("Hello, I am Jarvis. How can I help you?")

    while True:

        user_input = listen()

        if not user_input:
            continue

        response = ask_gemini(user_input)

        speak(response)

        print("DEBUG RESPONSE:", response)

if __name__ == "__main__":
    main()