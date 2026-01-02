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

export default function App() {
  // --- 1. 用户与全局状态 ---
  const [currentUser, setCurrentUser] = useState(null);
  const [mode, setMode] = useState('menu'); // menu, flashcard, quiz, results
  const [level, setLevel] = useState(1);
  const [quizCount, setQuizCount] = useState(20);
  
  // --- 2. 数据状态 ---
  const [allWords, setAllWords] = useState([]);      // 当前 Level 的所有单词
  const [quizQueue, setQuizQueue] = useState([]);    // 经过算法筛选的题目
  const [mastery, setMastery] = useState({});        // 熟练度记录 (来自后端)
  const [currentIndex, setIndex] = useState(0);      // 进度索引
  const [quizAnswers, setQuizAnswers] = useState([]); // Quiz 答题结果记录
  const [score, setScore] = useState(0);

  // --- 3. 数据加载逻辑 ---
  const fetchUserData = async (username) => {
    try {
      const res = await fetch(`http://localhost:5001/get_user_data?username=${username}`);
      const data = await res.json();
      setMastery(data.mastery || {});
      setLevel(data.progress.level || 1);
      setQuizCount(data.progress.quizCount || 20);
      setIndex(data.progress.index || 0);
    } catch (e) {
      console.error("Failed to load user data:", e);
    }
  };

  // 监听 Level 变化，加载对应的词库
  useEffect(() => {
    import(`./data/hsk-level-${level}.json`)
      .then(m => setAllWords(m.default))
      .catch(e => console.error("Data load error:", e));
  }, [level]);

  // --- 4. 核心交互逻辑 ---
  const handleLogin = async (username, password) => {
    const res = await fetch('http://localhost:5001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      setCurrentUser(username);
      fetchUserData(username);
    } else {
      alert("Invalid credentials. Try: Username = Password");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMastery({});
    setMode('menu');
  };

  const startMode = (newMode) => {
    if (newMode === 'quiz') {
      const selected = getSmartQuizWords(allWords, mastery, quizCount);
      setQuizQueue(selected);
      setScore(0);
      setQuizAnswers([]);
    }
    setIndex(0);
    setMode(newMode);
  };

  const updateMasteryRecord = async (char, newFields) => {
    const current = mastery[char] || { score: 1, lastQuiz: null, mistakeCount: 0 };
    const updated = { ...current, ...newFields, lastUpdate: new Date().toISOString() };
    
    setMastery(prev => ({ ...prev, [char]: updated }));

    await fetch('http://localhost:5001/save_mastery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser, char, record: updated })
    });
  };

  const saveProgress = useCallback(async (overrides = {}) => {
    if (!currentUser) return;
    const payload = {
      username: currentUser,
      level,
      quizCount,
      index: currentIndex,
      ...overrides
    };
    await fetch('http://localhost:5001/save_progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }, [currentUser, level, quizCount, currentIndex]);

  const speakChinese = (text) => {
    const audio = new Audio(`http://localhost:5001/tts?text=${encodeURIComponent(text)}`);
    audio.play();
  };

  // --- 5. 条件渲染渲染 ---
  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-4">
        {mode === 'menu' && (
            <Menu 
              level={level} 
              setLevel={setLevel} 
              quizCount={quizCount}
              setQuizCount={setQuizCount}
              startMode={startMode} 
            />
          )}

        {mode === 'flashcard' && (
          <FlashcardMode 
            data={allWords}
            currentIndex={currentIndex}
            setIndex={(i) => { setIndex(i); saveProgress({ index: i }); }}
            onBack={() => setMode('menu')}
            onSpeak={speakChinese}
            level={level}
            currentMastery={mastery[allWords[currentIndex]?.char]?.score}
            onUpdateMastery={(char, score) => updateMasteryRecord(char, { score })}
          />
        )}

        {mode === 'quiz' && (
          <QuizMode 
            word={quizQueue[currentIndex]}
            allWords={allWords}
            currentIndex={currentIndex}
            total={quizQueue.length}
            score={score}
            onSpeak={speakChinese}
            onExit={() => setMode('menu')}
            savedAnswer={quizAnswers[currentIndex]}
            onPrev={() => setIndex(prev => Math.max(0, prev - 1))}
            onNext={(isCorrect, answerData) => {
              if (isCorrect) setScore(s => s + 1);
              const newAnswers = [...quizAnswers];
              newAnswers[currentIndex] = answerData;
              setQuizAnswers(newAnswers);

              // 更新 SRS 记录
              const char = quizQueue[currentIndex].char;
              const currentRec = mastery[char] || {};
              updateMasteryRecord(char, {
                lastQuiz: new Date().toISOString(),
                lastResult: isCorrect,
                mistakeCount: isCorrect ? (currentRec.mistakeCount || 0) : (currentRec.mistakeCount || 0) + 1
              });

              if (currentIndex < quizQueue.length - 1) {
                setIndex(currentIndex + 1);
              } else {
                setMode('results');
              }
            }}
          />
        )}

        {mode === 'reading' && (
          <ReadingMode 
            // 将 level 转为字符串以匹配 JSON 的 Key
            data={sentencesData[level.toString()] || []} 
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