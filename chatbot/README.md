# ACE Chatbot with Google's Gemini API

A modern, responsive chatbot interface powered by Google's Gemini AI. This application provides a user-friendly chat interface that communicates with the Gemini Pro model to generate intelligent responses.

## Features

- 🚀 Real-time chat interface with typing indicators
- 📱 Responsive design that works on all devices
- 📋 Copy responses to clipboard with one click
- 🔒 Secure API key management with environment variables
- 🎨 Modern and clean user interface

## Prerequisites

- Python 3.8 or higher
- A Google Gemini API key (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation

1. Clone this repository or download the files
2. Navigate to the project directory:
   ```bash
   cd chatbot
   ```
3. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```
5. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Open `.env` and replace `your_gemini_api_key_here` with your actual Gemini API key

## Running the Application

1. Start the Flask development server:
   ```bash
   python app.py
   ```
2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

## Project Structure

```
chatbot/
├── .env.example           # Example environment variables
├── app.py                # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
└── templates/
    └── index.html        # Frontend HTML/CSS/JS
```

## Customization

### Styling
You can customize the appearance by modifying the CSS in `templates/index.html`. The application uses CSS variables for easy theming.

### API Endpoints
- `POST /api/chat` - Send a message to the chatbot
- `GET /api/health` - Check if the API is running

## Troubleshooting

- **API Key Issues**: Ensure your Gemini API key is correctly set in the `.env` file
- **Port Already in Use**: Change the port in `app.py` if port 5000 is already in use
- **Module Not Found**: Make sure all dependencies are installed from `requirements.txt`

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [Google's Gemini API](https://ai.google.dev/)
- [Flask](https://flask.palletsprojects.com/)
- [Font Awesome](https://fontawesome.com/) for icons
