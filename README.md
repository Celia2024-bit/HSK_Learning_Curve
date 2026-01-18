# HSK Study App (Full-Stack)

A comprehensive, full-stack Chinese language learning application designed to help users master HSK 1-3 vocabulary. The app features adaptive flashcards, interactive quizzes, reading mode with contextual sentences, and high-quality Text-to-Speech (TTS).

🚀 Live Demo

- Frontend: [https://hsk-learning-mu.vercel.app](https://hsk-learning-mu.vercel.app)
- Backend API: [https://backend-all-6q0a.onrender.com](https://backend-all-6q0a.onrender.com)
- Backend Pinyin API:
  
   https://audio-to-text-29330024195.europe-west2.run.app/pinyin

  

✨ Features

### Core Vocabulary Learning (HSK 1-3)

- **Multi-page Flashcards**: Each HSK 1-3 flashcard includes 4 pages (Chinese characters → Pinyin → English meaning → Combined view). Integrated play button for instant audio playback (audio files stored locally in frontend for ultra-fast loading).
- **Fixed Local Database**: HSK 1/2/3 word banks are fixed and consistent for all users, ensuring standardized learning content.
- **Reading Mode**: Contextual learning beyond single words – HSK 1/2/3 content is presented as short sentences to enhance practical comprehension and usage.

### Advanced Quiz Mode (3 Interactive Formats)

1. **Multiple-Choice Quiz**: Classic mode with a Chinese character/word and 4 English meaning options for selection.

2. **Chinese Pronunciation Assessment**:
   
   - Users pronounce Chinese characters/words via microphone; custom-built algorithm (deployed via Docker) analyzes vowels, consonants, and tones (avoids commercial API limitations).
   - Optimized pronunciation recognition logic: Focuses purely on phonetic accuracy (filters out semantic errors like "你豪世界" → "你好世界" misjudgment common in generic tools).

3. **Bilingual Oral Quiz**: Displays Chinese content, users speak the English/French meaning (no manual input/selection required) – system compares spoken meaning with standard translations for scoring.

### User Authentication & Personalization

- **Secure Auth System**: Registration and login functionality for personalized learning experiences.

- **Progress Persistence**: Cloud-stored user progress (flashcard reading position, reading mode progress) – resume learning seamlessly across sessions.

- **Customizable Quiz Settings**:
  
  - Toggle exclusion of incorrectly answered questions from future quizzes.
  - Select preferred quiz mode(s), set quiz question count (supports "all questions" option).

- **Custom Vocabulary Level (Level 0)**:
  
  - User-defined card creation for personalized word banks.
  - On-demand audio fetching from web sources (cached in browser for offline access).

### Adaptive Learning & Data Persistence

- **Cloud Storage**: All user configurations (flashcard/progress settings, quiz preferences) are stored in a remote database.
- **Spaced Repetition System (SRS)**: Quiz question lists are dynamically generated based on scientific memory curves – quiz results generate adaptive variables to optimize subsequent quiz content for efficient retention.

### Intelligent TTS

- Integrated google-cloud-texttospeech with adjustable speed and multiple voice profiles
  
   (e.g., cmn-CN-Wavenet-A, cmn-CN-Wavenet-B ,cmn-CN-Wavenet-C, cmn-CN-Wavenet-D).

🛠️ Tech Stack

### Frontend

- React.js: Functional components and Hooks (useState, useEffect).
- Tailwind CSS: Modern, responsive UI styling.
- Lucide React: Scalable vector icons.
- Local audio caching for flashcard playback.
- Deployment: Vercel.

### Backend

- Python Flask: RESTful API routing.
- Supabase: PostgreSQL database for user data, progress, and configuration persistence.
- Edge-TTS: Asynchronous speech synthesis (for Level 0 custom cards).
- Custom pronunciation analysis algorithm (Docker-deployed) for oral quiz mode.
- Spaced repetition logic for adaptive quiz generation.
- Deployment: Render.

⚙️ Setup & Installation

### Backend Setup

1. Navigate to the backend folder.

2. Install dependencies:
   
   requirement.text
   
   ```context
   flask
   flask-cors
   gunicorn
   edge-tts
   aiohttp
   baidu-aip
   chardet
   certifi
   requests
   groq
   Werkzeug
   google-cloud-texttospeech
   ```
   
   ```python
   pip install requirement.text
   ```

3. Configure your `config.py` with Supabase URL and Headers.

4. Deploy the custom pronunciation analysis service (Docker) as required for oral quiz mode.

5. Run the server:
   
   bash
   
   运行
   
   ```
   python main.py
   ```

### Frontend Setup

1. Navigate to the frontend folder.

2. Install dependencies:
   
   bash
   
   运行
   
   ```
   npm install
   ```

3. Update the `API_BASE` in `App.js` to point to your backend URL.

4. Start the development server:
   
   bash
   
   运行
   
   ```
   npm start
   ```

🔊 API Reference: TTS

The backend provides a flexible TTS endpoint for Level 0 custom cards:

- GET `/api/hsk/tts?text=你好&speed=0&voice=cmn-CN-Wavenet-A`
  - `text`: The Chinese characters to speak.
  - `speed`: Speed adjustment from -50 to 100 (Default: 0).
  - `voice`: Choose from various neural voices.
