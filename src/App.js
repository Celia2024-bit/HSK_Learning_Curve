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
  
  const [progressByLevel, setProgressByLevel] = useState({});
  const DEFAULT_PROGRESS = {
    quiz_count: DEFAULT_QUIZ_COUNT,
    current_index: 0,
    reading_index: 0,
    quiz_remove_correct: false,
  };



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
      const progressMap = await fetchUserProgress(username);
      setProgressByLevel(progressMap || {});
      
      // 用当前 level 对应的记录（无则默认）
      const key = String(level);
      const p = progressMap?.[key] || DEFAULT_PROGRESS;
      setQuizCount(p.quiz_count ?? DEFAULT_PROGRESS.quiz_count);
      setFlashcardIndex(p.current_index ?? DEFAULT_PROGRESS.current_index);
      setReadingIndex(p.reading_index ?? DEFAULT_PROGRESS.reading_index);
      setQuizRemoveCorrect(p.quiz_remove_correct ?? DEFAULT_PROGRESS.quiz_remove_correct);

      // 2. 获取该等级下的熟练度 (对应后端 /get_user_mastery)
      const masteryData = await fetchUserMastery(username);
      setMastery(masteryData || {});
    } catch (e) {
      console.error("Failed to load user data:", e);
    }
  };

  // 监听 level 变化加载本地 HSK 词库

// ① 同步当前 level 的进度到 UI（无网络请求）
  useEffect(() => {
    
   console.log('level type:', typeof level, level);             // 应该是 'number'
   console.log('progressByLevel keys:', Object.keys(progressByLevel)); // 应该类似 ["1","2","3"]

    const key = String(level);
    const p = progressByLevel?.[key] || DEFAULT_PROGRESS;
    setQuizCount(p.quiz_count ?? DEFAULT_PROGRESS.quiz_count);
    setFlashcardIndex(p.current_index ?? DEFAULT_PROGRESS.current_index);
    setReadingIndex(p.reading_index ?? DEFAULT_PROGRESS.reading_index);
    setQuizRemoveCorrect(p.quiz_remove_correct ?? DEFAULT_PROGRESS.quiz_remove_correct);
  }, [level, progressByLevel]);

  // ② 加载当前 level 的词库（保留你之前的代码）
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
    setProgressByLevel({});
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

  // ② saveProgress 的本地乐观更新 —— 用字符串键写入
  const saveProgress = useCallback(async (overrides = {}) => {
    if (!currentUser) return;

    // 目标级别：显式传入优先，否则用当前 level
    const targetLevel = (overrides.level !== undefined ? overrides.level : level);
    const key = String(targetLevel);

    // 以目标 level 的现有记录为基准（如果没有，退默认）
    const prevRecord = progressByLevel?.[key] || DEFAULT_PROGRESS;

    // 只把传进来的字段覆盖到目标 level，其它字段沿用目标 level 的现有值
    const record = {
      quiz_count:
        overrides.quizCount       ?? prevRecord.quiz_count       ?? DEFAULT_PROGRESS.quiz_count,
      current_index:
        overrides.index           ?? prevRecord.current_index    ?? DEFAULT_PROGRESS.current_index,
      reading_index:
        overrides.readingIndex    ?? prevRecord.reading_index    ?? DEFAULT_PROGRESS.reading_index,
      quiz_remove_correct:
        overrides.quizRemoveCorrect ?? prevRecord.quiz_remove_correct ?? DEFAULT_PROGRESS.quiz_remove_correct,
    };

    // 本地 Map 乐观更新（注意克隆，避免共享引用）
    setProgressByLevel(prev => ({
      ...prev,
      [key]: { ...record },
    }));

    // 发到后端
    await fetchSaveProgress({
      username: currentUser,
      level: targetLevel,
      record,
    });
  }, [currentUser, level, progressByLevel]);




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
            setIndex={(i) => { setFlashcardIndex(i); saveProgress({ level, index: i }); }}
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
              // 这里保持你原来的 updateMasteryRecord 逻辑即可
              if (isCorrect) setScore(s => s + 1);
              const newAnswers = [...quizAnswers];
              newAnswers[quizIndex] = answerData;
              setQuizAnswers(newAnswers);

              const char = quizQueue[quizIndex].char;
              const key = `${level}_${char}`;
              const currentRec = mastery[key] || {};
              
              updateMasteryRecord(char, {
                lastQuiz: new Date().toISOString(),
                lastResult: isCorrect,
                mistakeCount: isCorrect ? (currentRec.mistakeCount || 0) : (currentRec.mistakeCount || 0) + 1
              });
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
              saveProgress({ level, readingIndex: i }); 
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