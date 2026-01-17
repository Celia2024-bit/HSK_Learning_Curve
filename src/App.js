import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import Menu from './components/Menu';
import FlashcardMode from './components/FlashcardMode';
import QuizMode from './components/QuizMode';
import Results from './components/Results';
import ReadingMode from './components/ReadingMode';
import CardManager from './components/cardManager';
import SpeakingMode from './components/SpeakingMode';

import { getSmartQuizWords } from './utils/spacedRepetition';
import sentencesData from './data/sentences.json';
import { API_BASE, DEFAULT_QUIZ_COUNT } from './utils/constants';
import { fetchLogin, getTtsUrl } from './utils/fetchUtils';
import { useUserProgress } from './hooks/useUserProgress';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mode, setMode] = useState('menu');
  const [level, setLevel] = useState(1);
  
  // UI 状态
  const [quizCount, setQuizCount] = useState(DEFAULT_QUIZ_COUNT);
  const [quizRemoveCorrect, setQuizRemoveCorrect] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [readingIndex, setReadingIndex] = useState(0);
  
  // 测验相关
  const [quizQueue, setQuizQueue] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [score, setScore] = useState(0);

  // 使用自定义 hook 管理所有数据持久化逻辑
  const {
    allWords,
    mastery,
    progressByLevel,
    masteredWordsList,
    fetchUserData,
    loadWords,
    updateMasteryRecord,
    saveProgress,
    getCurrentProgress,
    resetData
  } = useUserProgress(currentUser, level);

  // 同步当前 level 的进度到 UI
  useEffect(() => {
    const p = getCurrentProgress();
    setQuizCount(p.quiz_count ?? DEFAULT_QUIZ_COUNT);
    setFlashcardIndex(p.current_index ?? 0);
    setReadingIndex(p.reading_index ?? 0);
    setQuizRemoveCorrect(p.quiz_remove_correct ?? false);
  }, [level, progressByLevel, getCurrentProgress]);

  // 登录
  const handleLogin = async (username, password) => {
    const res = await fetchLogin(username, password);
    if (res.ok) {
      setCurrentUser(username);
      fetchUserData(username);
    } else {
      alert("Invalid credentials.");
    }
  };

  // 登出
  const handleLogout = () => {
    setCurrentUser(null);
    resetData();
    setMode('menu');
  };

  // 开始某个模式
  const startMode = (newMode) => {
    if (newMode === 'reading' && level === 0) {
      return;
    }

    if (newMode === 'quiz' || newMode === 'speaking') {
      // === (1) 公共的部分 ===
      let pool = (quizCount === 'ALL') 
        ? allWords 
        : (masteredWordsList.length > 5 ? masteredWordsList : allWords);

      // === (2) newMode === quiz ===
      if (newMode === 'quiz') {
        pool = pool.filter(word => {
          const key = `${level}_${word.char}`;
          const record = mastery[key];
          if (!record) return true;
          
          const hasRecord = record.lastQuiz !== undefined;
          const isCorrect = quizRemoveCorrect ? record.lastResult === true : false;
          return quizCount === 'ALL' ? true : (hasRecord && !isCorrect);
        });
      }

      // === (3) newMode === speaking ===
      if (newMode === 'speaking') {
        pool = pool.filter(word => {
          const key = `${level}_${word.char}`;
          const record = mastery[key];
          if (!record) return true;

          const hasRecord = record.lastSpeakingQuiz !== undefined;
          const isCorrect = quizRemoveCorrect ? record.lastSpeakingResult === true : false;
          return quizCount === 'ALL' ? true : (hasRecord && !isCorrect);
        });
      }

      // 防御处理与生成队列
      if (pool.length === 0) pool = allWords;
      const countToFetch = (quizCount === 'ALL') ? allWords.length : quizCount;
      const selected = getSmartQuizWords(pool, countToFetch);
      
      setQuizQueue(selected);
      setScore(0);
      setQuizAnswers([]);
      setQuizIndex(0);
    }
    
    setMode(newMode);
  };

  // 朗读中文
  const speakChinese = async (text, isSlow = true) => {
    const audioUrl = getTtsUrl(text, isSlow);
    const audio = new Audio(audioUrl);
    try {
      await audio.play();
    } catch (err) {
      console.error("Audio play error:", err);
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
            showCardManager={level === 0}
            onOpenCardManager={() => setMode('cards')}
          />
        )}

        {mode === 'cards' && (
          <CardManager
            username={currentUser}
            onClose={() => setMode('menu')}
            onUpdate={loadWords}
          />
        )}

        {mode === 'flashcard' && (
          <FlashcardMode 
            data={allWords}
            currentIndex={flashcardIndex}
            setIndex={(i) => { 
              const currentChar = allWords[flashcardIndex]?.char;
              if (currentChar) {
                updateMasteryRecord(currentChar, { 
                  lastUpdate: new Date().toISOString() 
                });
              }
              setFlashcardIndex(i); 
              saveProgress({ level, index: i }); 
            }}
            onBack={() => setMode('menu')}
            onSpeak={speakChinese}
            level={level}
            currentMastery={mastery[`${level}_${allWords[flashcardIndex]?.char}`]?.score}
            onUpdateMastery={(char, score) => {
              updateMasteryRecord(char, { score });
            }}
          />
        )}

        {mode === 'quiz' && (
          <QuizMode 
            word={quizQueue[quizIndex]} 
            quizPool={allWords} 
            currentIndex={quizIndex}
            total={quizQueue.length}
            score={score}
            onSpeak={speakChinese}
            onExit={() => setMode('menu')}
            savedAnswer={quizAnswers[quizIndex]}
            onPrev={() => setQuizIndex(prev => Math.max(0, prev - 1))}
            onNext={(isCorrect, answerData, shouldMove = true) => {
              if (isCorrect) setScore(s => s + 1);
              if (answerData) {
                const newAnswers = [...quizAnswers];
                newAnswers[quizIndex] = answerData;
                setQuizAnswers(newAnswers);
              }

              const char = quizQueue[quizIndex].char;
              const key = `${level}_${char}`;
              const currentRec = mastery[key] || {};
              
              updateMasteryRecord(char, {
                lastQuiz: new Date().toISOString(),
                lastResult: isCorrect,
                mistakeCount: isCorrect ? (currentRec.mistakeCount || 0) : (currentRec.mistakeCount || 0) + 1
              });

              if (shouldMove) {
                if (quizIndex < quizQueue.length - 1) {
                  setQuizIndex(quizIndex + 1);
                } else {
                  setMode('results');
                }
              }
            }}
          />
        )}

        {mode === 'speaking' && (
          <SpeakingMode
            word={quizQueue[quizIndex]}
            currentIndex={quizIndex}
            total={quizQueue.length}
            onSpeak={speakChinese}
            onExit={() => setMode('menu')}
            onPrev={() => setQuizIndex(prev => Math.max(0, prev - 1))}
            onNext={(isCorrect, answerData, shouldMove = true) => {
              const char = quizQueue[quizIndex].char;
              const key = `${level}_${char}`;
              const currentRec = mastery[key] || {};
             
              updateMasteryRecord(char, {
                lastSpeakingQuiz: new Date().toISOString(), // 记录练习时间
                lastSpeakingResult: isCorrect,              // 记录是否全对
                // 如果错了，speakingMistakeCount 加 1
                speakingMistakeCount: isCorrect 
                  ? (currentRec.speakingMistakeCount || 0) 
                  : (currentRec.speakingMistakeCount || 0) + 1
              });

              if (shouldMove) {
                if (quizIndex < quizQueue.length - 1) {
                  setQuizIndex(quizIndex + 1);
                } else {
                  setMode('results'); 
                }
              }
            }}
          />
        )}

        {mode === 'reading' && level !== 0 && (
          <ReadingMode
            data={sentencesData[level.toString()] || []}
            currentIndex={readingIndex}
            setIndex={(i) => { setReadingIndex(i); saveProgress({ readingIndex: i }); }}
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