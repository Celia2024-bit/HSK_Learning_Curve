import React, { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
import Menu from './components/Menu';
import FlashcardMode from './components/FlashcardMode';
import ReadingMode from './components/ReadingMode';
import QuizMode from './components/QuizMode';
import Results from './components/Results';
import { speakChinese } from './utils/ttsService';
import { getSmartQuizWords } from './utils/spacedRepetition'; // 我们等下创建这个算法文件

export default function HSKStudyApp() {
  // --- 1. 核心状态 ---
  const [level, setLevel] = useState(1);
  const [mode, setMode] = useState('menu');
  const [hskData, setHskData] = useState({ 1: [], 2: [], 3: [] });
  const [sentences, setSentences] = useState({ 1: [], 2: [], 3: [] });
  const [shuffledWords, setShuffledWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizCount, setQuizCount] = useState(20); // 用户自定义题目数
  
  // mastery 现在是复杂对象: { "爱": { score: 5, lastRead: "...", mistakeCount: 0, ... } }
  const [mastery, setMastery] = useState({}); 
  
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- 2. 增强型数据持久化 ---

  // 保存进度 (Level/Index)
  const saveProgress = useCallback(async (currentLevel, currentMode, index) => {
    try {
      await fetch('http://localhost:5001/save_progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: currentLevel, mode: currentMode, index: index })
      });
    } catch (e) { console.warn("Progress sync failed"); }
  }, []);

  // 核心：更新单词的 SRS 记录
  const updateMasteryRecord = async (char, updates) => {
    const oldRecord = mastery[char] || { 
      score: 1, 
      lastRead: null, 
      lastQuiz: null, 
      lastResult: null, 
      mistakeCount: 0 
    };

    const newRecord = {
      ...oldRecord,
      ...updates,
      // 如果这次测验错了，错误计数 +1
      mistakeCount: updates.lastResult === false 
        ? (oldRecord.mistakeCount || 0) + 1 
        : (oldRecord.mistakeCount || 0)
    };

    // 更新本地状态
    setMastery(prev => ({ ...prev, [char]: newRecord }));

    // 同步到后端 mastery.json
    try {
      await fetch('http://localhost:5001/save_mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ char, record: newRecord })
      });
    } catch (e) { console.error("Mastery sync failed", e); }
  };

  // 初始化加载
  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        const [h1, h2, h3, sent, prog, mast] = await Promise.all([
          fetch('/hsk1.json').then(res => res.json()),
          fetch('/hsk2.json').then(res => res.json()),
          fetch('/hsk3.json').then(res => res.json()),
          fetch('/sentences.json').then(res => (res.ok ? res.json() : { 1: [], 2: [], 3: [] })),
          fetch('http://localhost:5001/get_progress').then(res => res.ok ? res.json() : null),
          fetch('http://localhost:5001/get_mastery').then(res => res.ok ? res.json() : {})
        ]);

        setHskData({ 1: h1, 2: h2, 3: h3 });
        setSentences(sent);
        setMastery(mast);
        if (prog) setLevel(prog.level);
        setLoading(false);
      } catch (err) {
        console.error("Init Error:", err);
        setLoading(false);
      }
    };
    initApp();
  }, []);

  // --- 3. 智能模式启动 ---

  const startMode = async (selectedMode) => {
    let dataList;
    let startIdx = 0;

    if (selectedMode === 'quiz') {
      // 使用 SRS 算法抽题
      dataList = getSmartQuizWords(hskData[level], mastery, quizCount);
    } else {
      dataList = selectedMode === 'reading' ? sentences[level] : hskData[level];
      // 尝试恢复非 Quiz 模式的进度
      try {
        const res = await fetch('http://localhost:5001/get_progress');
        const prog = await res.json();
        if (prog && prog.mode === selectedMode && prog.level === level) {
          startIdx = prog.index;
        }
      } catch (e) {}
    }

    setShuffledWords(dataList);
    setCurrentIndex(startIdx);
    setScore(0);
    setQuizAnswers([]);
    setMode(selectedMode);
  };

  // --- 4. 渲染 ---

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {mode === 'menu' && (
        <Menu 
          level={level} setLevel={setLevel} 
          startMode={startMode} 
          quizCount={quizCount} setQuizCount={setQuizCount} 
        />
      )}

      {mode === 'flashcard' && (
        <FlashcardMode 
          data={shuffledWords}
          currentIndex={currentIndex}
          setIndex={(idx) => {
            setCurrentIndex(idx);
            saveProgress(level, 'flashcard', idx);
          }}
          onBack={() => setMode('menu')}
          onSpeak={speakChinese}
          level={level}
          // 传递完整的 record 或默认 1
          currentMastery={mastery[shuffledWords[currentIndex]?.char]?.score || 1}
          onUpdateMastery={(char, score) => 
            updateMasteryRecord(char, { score, lastRead: new Date().toISOString() })
          }
        />
      )}

      {mode === 'reading' && (
        <ReadingMode 
          data={shuffledWords}
          currentIndex={currentIndex}
          setIndex={(idx) => {
            setCurrentIndex(idx);
            saveProgress(level, 'reading', idx);
          }}
          onBack={() => setMode('menu')}
          onSpeak={speakChinese}
          level={level}
        />
      )}

      {mode === 'quiz' && (
        <QuizMode 
          word={shuffledWords[currentIndex]} 
          allWords={hskData[level]} 
          currentIndex={currentIndex}
          total={shuffledWords.length}
          score={score}
          onSpeak={speakChinese}
          savedAnswer={quizAnswers[currentIndex]} 
          onExit={() => setMode('menu')}
          onNext={(isCorrect, ans) => {
            const newAns = [...quizAnswers];
            newAns[currentIndex] = ans;
            setQuizAnswers(newAns);
            
            // Quiz 结束这一题时，记录结果到 SRS
            updateMasteryRecord(shuffledWords[currentIndex].char, {
              lastQuiz: new Date().toISOString(),
              lastResult: isCorrect
            });

            if (isCorrect && !quizAnswers[currentIndex]) setScore(s => s + 1);
            if (currentIndex < shuffledWords.length - 1) setCurrentIndex(currentIndex + 1);
            else setMode('results');
          }}
          onPrev={() => setCurrentIndex(currentIndex - 1)}
        />
      )}

      {mode === 'results' && (
        <Results score={score} total={shuffledWords.length} quizAnswers={quizAnswers} onRetry={() => startMode('quiz')} onMenu={() => setMode('menu')} />
      )}
    </div>
  );
}