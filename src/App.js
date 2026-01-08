import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  fetchWordsByLevel, 
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

  const [flashcardIndex, setFlashcardIndex] = useState(0); 
  const [quizIndex, setQuizIndex] = useState(0);         
  const [readingIndex, setReadingIndex] = useState(0);   
  const [quizAnswers, setQuizAnswers] = useState([]); 
  const [score, setScore] = useState(0);

  // --- 核心改动：生成“已学单词”子表 ---
  // 根据数据库截图，Key 格式为 "1_不"，此处逻辑与之对齐
  const masteredWordsList = useMemo(() => {
    if (!allWords.length) return [];
    return allWords
      .filter(word => {
        const key = `${level}_${word.char}`;
        return mastery[key] !== undefined;
      })
      .map(word => ({
        ...word,
        masteryInfo: mastery[`${level}_${word.char}`] 
      }));
  }, [allWords, mastery, level]);

  const fetchUserData = async (username) => {
    try {
      // 1. 获取进度 (对应后端 /get_user_progress)
      const progress = await fetchUserProgress(username);
      const currentLevel = progress.level || 1; 
      
      // 2. 获取该等级下的熟练度 (对应后端 /get_user_mastery)
      const masteryData = await fetchUserMastery(username, currentLevel);
      
      setMastery(masteryData || {});
      setLevel(currentLevel);
      setQuizCount(progress.quiz_count || DEFAULT_QUIZ_COUNT); 
      setFlashcardIndex(progress.current_index || 0);  
      setReadingIndex(progress.reading_index || 0);   
      setQuizRemoveCorrect(progress.quiz_remove_correct || false);      
    } catch (e) {
      console.error("Failed to load user data:", e);
    }
  };

  // 监听 level 变化加载本地 HSK 词库
  useEffect(() => {
    const loadData = async () => {
      try {
        const words = await fetchWordsByLevel(level);
        setAllWords(words);
      } catch (e) {
        console.error("Words load error:", e);
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
      // 1. 确定池子：如果有已学单词就用子表，否则用全集
      let pool = masteredWordsList.length > 5 ? masteredWordsList : allWords;

      // 2. 如果开启了“移除上次正确”，在池子里滤掉
      if (quizRemoveCorrect) {
        pool = pool.filter(word => {
        // 1. 获取这个字在 Map 里的记录
        const key = `${level}_${word.char}`;
        const record = mastery[key];
        
        // 2. 如果没考过(record不存在)，或者上次考错了(lastResult !== true)，就保留
        // 只有“明确考过且结果为正确”的才过滤掉
        return !record || record.lastResult !== true;
      });
    }

      // 3. 调用简化后的函数，只传 pool 和 count
      const selected = getSmartQuizWords(pool, quizCount);
      
      setQuizQueue(selected);
      setScore(0);
      setQuizAnswers([]);
      setQuizIndex(0); 
    }
    setMode(newMode);
  };

  const updateMasteryRecord = async (char, newFields) => {
    const key = `${level}_${char}`;
    const current = mastery[key] || { score: 1, lastQuiz: null, mistakeCount: 0 };
    const updated = { ...current, ...newFields, level, lastUpdate: new Date().toISOString() };
    
    // 更新本地 state，触发 masteredWordsList 重新计算
    setMastery(prevMap => ({
      ...prevMap,
      [key]: { ...prevMap[key], ...newFields }
    }));
    
    try {
      await fetchSaveMastery(currentUser, char, level, updated);
    } catch (e) {
      console.error("保存失败:", e);
    }
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
            currentMastery={mastery[`${level}_${allWords[flashcardIndex]?.char}`]?.score}
            onUpdateMastery={(char, score) => updateMasteryRecord(char, { score })}
          />
        )}

        {mode === 'quiz' && (
          <QuizMode 
            // 1. 当前这道题（主角）
            word={quizQueue[quizIndex]} 
            
            // 2. 整个级别的词库（用来提供错误的干扰项）
            quizPool={allWords} 
            
            // 3. 进度信息
            currentIndex={quizIndex}
            total={quizQueue.length}
            score={score}
            
            // 4. 函数回调
            onSpeak={speakChinese}
            onExit={() => setMode('menu')}
            savedAnswer={quizAnswers[quizIndex]}
            onPrev={() => setQuizIndex(prev => Math.max(0, prev - 1))}
            onNext={(isCorrect, answerData, shouldMove = true) => {
              if (answerData) {
                const newAnswers = [...quizAnswers];
                newAnswers[quizIndex] = answerData; // 包含 allOptions
                setQuizAnswers(newAnswers);

                const char = quizQueue[quizIndex].char;
                // updateMasteryRecord(...) 更新数据库逻辑
                if (isCorrect) setScore(s => s + 1);
              }

              // 2. 只有当 shouldMove 为 true 时，才真正翻页
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