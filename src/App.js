import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import Menu from './components/Menu';
import FlashcardMode from './components/FlashcardMode';
import QuizMode from './components/QuizMode';
import Results from './components/Results';
import ReadingMode from './components/ReadingMode';
import CustomWordEditor from './components/CustomWordEditor';
import { getSmartQuizWords } from './utils/spacedRepetition';
import sentencesData from './data/sentences.json';

import { API_BASE, DEFAULT_QUIZ_COUNT } from './utils/constants';
import { 
  fetchUserProgress, 
  fetchLogin, 
  fetchSaveMastery, 
  fetchSaveProgress, 
  getTtsUrl, 
  fetchCustomWords, 
  addCustomWord,
  updateCustomWord,
  deleteCustomWord,
  fetchWordsByLevel 
} from './utils/fetchUtils';

const CUSTOM_LEVEL = 0;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mode, setMode] = useState('menu');
  const [level, setLevel] = useState(1);
  const [quizCount, setQuizCount] = useState(DEFAULT_QUIZ_COUNT);
  const [quizRemoveCorrect, setQuizRemoveCorrect] = useState(false);
  
  const [allWords, setAllWords] = useState([]);      
  const [quizQueue, setQuizQueue] = useState([]);    
  const [mastery, setMastery] = useState({});        
  const [customWords, setCustomWords] = useState([]);

  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [readingIndex, setReadingIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]); 
  const [score, setScore] = useState(0);


  const fetchUserData = async (username) => {
    try {
      const data = await fetchUserProgress(username);
      setMastery(data.mastery || {});
      setLevel(data.progress.level || 1);
      setQuizCount(data.progress.quiz_count || DEFAULT_QUIZ_COUNT); 
      setFlashcardIndex(data.progress.current_index || 0);
      setReadingIndex(data.progress.reading_index || 0);
      setQuizRemoveCorrect(data.progress.quizRemoveCorrect || false);      
      if (currentUser) {
        const words = await fetchCustomWords(currentUser);
        setCustomWords(words);
      }
    } catch (e) {
      console.error("Failed to load user data:", e);
    }
  };

  // 修改：单词加载逻辑 - 区分 HSK/自定义级别
  useEffect(() => {
    const loadWords = async () => {
      if (currentUser) {
        const words = await fetchWordsByLevel(level, currentUser);
        setAllWords(words);
        if (level === CUSTOM_LEVEL) {
          setCustomWords(words);
        }

      }
    };

    if (currentUser) {
      loadWords();
    }
  }, [level, currentUser]);


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
    if (newMode === 'reading' && level === CUSTOM_LEVEL) {
      alert("自定义单词库无阅读模式！");
      return;
    }

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

  const handleAddCustomWord = async (word) => {
    const success = await addCustomWord(currentUser, word);
    if (success) {
      const updatedWords = await fetchCustomWords(currentUser);
      setCustomWords(updatedWords);
      if (level === CUSTOM_LEVEL) {
        setAllWords(updatedWords);
      }
    }
  };

  const updateMasteryRecord = async (char, newFields) => {
    const current = mastery[char] || { score: 1, lastQuiz: null, mistakeCount: 0 , level};
    const updated = { ...current, ...newFields, level, lastUpdate: new Date().toISOString() };
    
    setMastery(prev => ({ ...prev, [char]: updated }));
    await fetchSaveMastery(currentUser, char, updated);
  };

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

        {mode === 'custom-editor' && (
            <CustomWordEditor 
              words={customWords}
              onAddWord={handleAddCustomWord}
              onUpdateWord={async (updatedWord) => {
                const success = await updateCustomWord(updatedWord.id, {
                  pinyin: updatedWord.pinyin,
                  meaning: updatedWord.meaning,
                  explanation: updatedWord.explanation
                });
                if (success) {
                  const updatedWords = await fetchCustomWords(currentUser);
                  setCustomWords(updatedWords);
                }
              }}
              onDeleteWord={async (cardId) => {
                const success = await deleteCustomWord(cardId);
                if (success) {
                  const updatedWords = await fetchCustomWords(currentUser);
                  setCustomWords(updatedWords);
                }
              }}
              onBack={() => setMode('menu')}
            />
          )}

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

        {mode === 'reading' && level !== CUSTOM_LEVEL && (
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