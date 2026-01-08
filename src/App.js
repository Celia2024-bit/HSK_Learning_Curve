import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import Menu from './components/Menu';
import FlashcardMode from './components/FlashcardMode';
import QuizMode from './components/QuizMode';
import Results from './components/Results';
import ReadingMode from './components/ReadingMode';
import { getSmartQuizWords } from './utils/spacedRepetition';
import sentencesData from './data/sentences.json';

import { API_BASE, DEFAULT_QUIZ_COUNT } from './utils/constants';
import { 
  fetchUserProgress, 
  fetchUserMastery, 
  fetchWordsByLevel, // 新增
  fetchLogin, 
  fetchSaveMastery, 
  fetchSaveProgress, 
  getTtsUrl 
} from './utils/fetchUtils';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mode, setMode] = useState('menu');
  const [level, setLevel] = useState(1);
  const [quizCount, setQuizCount] = useState(DEFAULT_QUIZ_COUNT);
  const [quizRemoveCorrect, setQuizRemoveCorrect] = useState(false);
  
  const [allWords, setAllWords] = useState([]);      
  const [quizQueue, setQuizQueue] = useState([]);    
  const [mastery, setMastery] = useState({});        

  const [flashcardIndex, setFlashcardIndex] = useState(0); // Flashcard 专属
  const [quizIndex, setQuizIndex] = useState(0);         // Quiz 专属
  const [readingIndex, setReadingIndex] = useState(0);   // Reading 专属
  const [quizAnswers, setQuizAnswers] = useState([]); 
  const [score, setScore] = useState(0);


  const fetchUserData = async (username) => {
    try {
      const progress = await fetchUserProgress(username);
      const currentLevel = progress.level || 1; 
      const mastery = await fetchUserMastery(username, currentLevel);
      setMastery(mastery || {});
      setLevel(currentLevel);
      setQuizCount(progress.quiz_count || DEFAULT_QUIZ_COUNT); 
      setFlashcardIndex(progress.current_index || 0);  // Flashcard 索引
      setReadingIndex(progress.reading_index || 0);   // Reading 索引
      setQuizRemoveCorrect(progress.quizRemoveCorrect || false);      
    } catch (e) {
      console.error("Failed to load user data:", e);
    }
  };

    useEffect(() => {
      const loadData = async () => {
        try {
          const words = await fetchWordsByLevel(level);
          setAllWords(words);
        } catch (e) {
          // 错误已在 fetchWordsByLevel 中 log，这里可以做 UI 提示
        }
      };
      
      loadData();
    }, [level]);

  const handleLogin = async (username, password) => {
    const res = await fetchLogin(username, password);
    if (res.ok) {
      setCurrentUser(username);
      fetchUserData(username);
    } else {
      alert("Invalid credentials.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMastery({});
    setMode('menu');
  };


  const startMode = (newMode) => {
    if (newMode === 'quiz') {
      let filteredWords = [...allWords];
      if (quizRemoveCorrect) {
        filteredWords = filteredWords.filter(word => {
          const wordMastery = mastery[word.char] || {};
          return wordMastery.lastResult !== true;
        });
      }
      const selected = getSmartQuizWords(filteredWords, mastery, quizCount, level);
      setQuizQueue(selected);
      setScore(0);
      setQuizAnswers([]);
      setQuizIndex(0); 
    }

    setMode(newMode);
  };

  // 4. 修改保存熟练度地址
  const updateMasteryRecord = async (char, newFields) => {
    const current = mastery[char] || { score: 1, lastQuiz: null, mistakeCount: 0 , level};
    const updated = { ...current, ...newFields, level, lastUpdate: new Date().toISOString() };
    
    setMastery(prev => ({ ...prev, [char]: updated }));
    await fetchSaveMastery(currentUser, char, updated);
  };

 // 5. 修改保存进度地址
  const saveProgress = useCallback(async (overrides = {}) => {
        if (!currentUser) return;
        const payload = {
          username: currentUser,
          level: overrides.level !== undefined ? overrides.level : level,
          quizCount: overrides.quizCount !== undefined ? overrides.quizCount : quizCount,
          index: overrides.index !== undefined ? overrides.index : flashcardIndex, 
          readingIndex: overrides.readingIndex !== undefined ? overrides.readingIndex : readingIndex, 
          quizRemoveCorrect: overrides.quizRemoveCorrect !== undefined ? overrides.quizRemoveCorrect : quizRemoveCorrect
        };
        await fetchSaveProgress(payload);
    }, [currentUser, level, quizCount, flashcardIndex, readingIndex, quizRemoveCorrect]);

  // 6. 修改 TTS 地址
  const speakChinese = async (text, isSlow = true) => {
      const audioUrl = getTtsUrl(text, isSlow);
      const audio = new Audio(audioUrl);
      
      try {
        await audio.play();
      } catch (err) {
        console.error("播放失败:", err);
      }
    };

  if (!currentUser) {
    return <Login onLogin={handleLogin} apiUrl={API_BASE} />;
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <main className="max-w-4xl mx-auto px-4">
        {mode === 'menu' && (
            <Menu 
              level={level} 
              setLevel={(l) => { setLevel(l); saveProgress({ level: l }); }} 
              quizCount={quizCount}
              setQuizCount={(c) => { setQuizCount(c); saveProgress({ quizCount: c }); }}
              quizRemoveCorrect={quizRemoveCorrect}
              setQuizRemoveCorrect={(val) => { 
                setQuizRemoveCorrect(val); 
                saveProgress({ quizRemoveCorrect: val }); 
              }}
              startMode={startMode} 
            />
          )}

        {/* Flashcard 模式：使用专属索引 */}
        {mode === 'flashcard' && (
          <FlashcardMode 
            data={allWords}
            currentIndex={flashcardIndex}
            setIndex={(i) => { setFlashcardIndex(i); saveProgress({ index: i }); }}
            onBack={() => setMode('menu')}
            onSpeak={speakChinese}
            level={level}
            currentMastery={mastery[allWords[flashcardIndex]?.char]?.score}
            onUpdateMastery={(char, score) => updateMasteryRecord(char, { score })}
          />
        )}

        {/* Quiz 模式：使用专属索引 */}
        {mode === 'quiz' && (
          <QuizMode 
            word={quizQueue[quizIndex]}
            allWords={allWords.filter(word => (mastery[word.char]?.level || level) === level)}
            currentIndex={quizIndex}
            total={quizQueue.length}
            score={score}
            onSpeak={speakChinese}
            onExit={() => setMode('menu')}
            savedAnswer={quizAnswers[quizIndex]}
            onPrev={() => setQuizIndex(prev => Math.max(0, prev - 1))}
            onNext={(isCorrect, answerData) => {
              if (isCorrect) setScore(s => s + 1);
              const newAnswers = [...quizAnswers];
              newAnswers[quizIndex] = answerData;
              setQuizAnswers(newAnswers);

              const char = quizQueue[quizIndex].char;
              const currentRec = mastery[char] || {};
              updateMasteryRecord(char, {
                lastQuiz: new Date().toISOString(),
                lastResult: isCorrect,
                mistakeCount: isCorrect ? (currentRec.mistakeCount || 0) : (currentRec.mistakeCount || 0) + 1
              });

              if (quizIndex < quizQueue.length - 1) {
                setQuizIndex(quizIndex + 1);
              } else {
                setMode('results');
              }
            }}
          />
        )}

        {mode === 'reading' && (
          <ReadingMode 
            data={sentencesData[level.toString()] || []} 
            currentIndex={readingIndex}
            setIndex={(i) => { 
              setReadingIndex(i); 
              saveProgress({ readingIndex: i }); 
            }}
            onBack={() => setMode('menu')}
            onSpeak={speakChinese}
          />
        )}
        
        {mode === 'results' && (
          <Results 
            score={score} 
            total={quizQueue.length} 
            quizAnswers={quizAnswers} 
            onRetry={() => startMode('quiz')}
            onMenu={() => setMode('menu')}
            onSpeak={speakChinese}
          />
        )}
      </main>
    </div>
  );
}