import os
import re
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from google import genai
from google.genai import types
from dotenv import load_dotenv

from pathlib import Path

# Load environment variables from .env file in the same directory
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Gemini API
# Configure Gemini API
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

if not GEMINI_API_KEY or "your_gemini_api_key" in GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY not found in environment variables.")
    print("Please create a .env file in the chatbot directory with GEMINI_API_KEY=your_new_key")
    # Don't use a fallback that might be leaked. Let it fail or use a placeholder that will error cleanly.
    GEMINI_API_KEY = None

# Initialize the client + model
GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        if not client:
             return jsonify({
                'error': 'Chatbot is not configured properly. API Key missing.',
                'status': 'error'
            }), 503

        # Generate response using Gemini
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are ACE CHATBOT for an educational website. "
                    "Reply in clear Markdown. Use a friendly tone and add 1-3 relevant emojis. "
                    "Be concise but COMPLETE: fully answer the question. "
                    "Stay strictly on-topic: do not add unrelated info. "
                    "If the user question is unclear, ask 1 clarifying question before answering. "
                    "If you are not sure about a fact, say you are not sure instead of guessing. "
                    "Prefer headings + bullet points + a short example. "
                    "Avoid very long paragraphs; if the topic is big, summarize and offer to expand."
                ),
                max_output_tokens=600,
                temperature=0.25,
            ),
        )

        response_text = getattr(response, 'text', None) or ""
        if not response_text:
            return jsonify({
                'error': 'Empty response from model',
                'status': 'error'
            }), 502
        
        return jsonify({
            'response': response_text,
            'status': 'success'
        })
    except Exception as e:
        msg = str(e)
        lowered = msg.lower()
        if ('quota' in lowered) or ('resource_exhausted' in lowered) or ('429' in lowered):
            retry_after_seconds = None
            m = re.search(r"retry\s+in\s+([0-9]+(?:\.[0-9]+)?)s", msg, flags=re.IGNORECASE)
            if m:
                try:
                    retry_after_seconds = int(float(m.group(1)) + 0.999)
                except ValueError:
                    retry_after_seconds = None
            if retry_after_seconds is None:
                m = re.search(r"'retryDelay'\s*:\s*'([0-9]+)s'", msg)
                if m:
                    try:
                        retry_after_seconds = int(m.group(1))
                    except ValueError:
                        retry_after_seconds = None
            return jsonify({
                'error': 'API quota exceeded. Please wait and try again later, or use an API key with available quota/billing enabled.',
                'retry_after_seconds': retry_after_seconds,
                'status': 'error'
            }), 429
        return jsonify({
            'error': msg,
            'status': 'error'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model': GEMINI_MODEL,
        'api': 'running'
    })

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)
