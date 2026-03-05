import google.genai as genai
from config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)

def ask_gemini(prompt):
    try:
        response = client.models.generate_content(
            model='models/gemini-2.5-flash',
            contents=prompt
        )
        print("Gemini Response:", response.text)
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "Sorry, I encountered an error connecting to Gemini."