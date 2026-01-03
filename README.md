HSK Study App (Full-Stack)
A comprehensive, full-stack Chinese language learning application designed to help users master HSK 1-3 vocabulary. The app features adaptive flashcards, interactive quizzes, and high-quality Text-to-Speech (TTS).

🚀 Live Demo
Frontend: https://hsk-learning-mu.vercel.app

Backend API: https://backend-all-6q0a.onrender.com

✨ Features
User Authentication: Secure registration and login system.

Progress Tracking: Cloud-based storage for HSK levels, current word index, and mastery records using Supabase.

Intelligent TTS: Integrated Microsoft Edge TTS with adjustable speed and multiple voice profiles (e.g., Mandarin Male/Female).

Flashcard Mode: Randomized word rotation with Pinyin and meaning toggles.

Quiz Mode: Interactive multiple-choice testing with real-time scoring and result analysis.

🛠️ Tech Stack
Frontend
React.js: Functional components and Hooks (useState, useEffect).

Tailwind CSS: Modern, responsive UI styling.

Lucide React: Scalable vector icons.

Deployment: Vercel.

Backend
Python Flask: RESTful API routing.

Supabase: PostgreSQL database for user data and progress persistence.

Edge-TTS: Asynchronous speech synthesis.

Deployment: Render.

⚙️ Setup & Installation
Backend Setup
Navigate to the backend folder.

Install dependencies:

Bash

pip install flask flask-cors requests edge-tts asyncio
Configure your config.py with Supabase URL and Headers.

Run the server:

Bash

python main.py
Frontend Setup
Navigate to the frontend folder.

Install dependencies:

Bash

npm install
Update the API_BASE in App.js to point to your backend URL.

Start the development server:

Bash

npm start
🔊 API Reference: TTS
The backend provides a flexible TTS endpoint: GET /api/hsk/tts?text=你好&speed=0&voice=Mandarin Male (Yunjian)

text: The Chinese characters to speak.

speed: Speed adjustment from -50 to 100 (Default: 0).

voice: Choose from various neural voices.