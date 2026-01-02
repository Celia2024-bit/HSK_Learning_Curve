import React, { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
import Menu from './components/Menu';
import FlashcardMode from './components/FlashcardMode';
import ReadingMode from './components/ReadingMode';
import QuizMode from './components/QuizMode';
import Results from './components/Results';
import { speakChinese } from './utils/ttsService';

export default function HSKStudyApp() {
  const [level, setLevel] = useState(1);
  const [mode, setMode] = useState('menu');
  const [hskData, setHskData] = useState({ 1: [], 2: [], 3: [] });
  const [sentences, setSentences] = useState({ 1: [], 2: [], 3: [] });
  const [shuffledWords, setShuffledWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. 进度持久化逻辑 ---
  
  // 保存进度到后端
  const saveProgress = useCallback(async (currentLevel, currentMode, index) => {
    try {
      await fetch('http://localhost:5001/save_progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: currentLevel,
          mode: currentMode,
          index: index
        })
      });
    } catch (e) {
      console.warn("进度保存失败", e);
    }
  }, []);

  // 加载数据并恢复进度
  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        // 加载词库和进度
        const [h1, h2, h3, sent, prog] = await Promise.all([
          fetch('/hsk1.json').then(res => res.json()),
          fetch('/hsk2.json').then(res => res.json()),
          fetch('/hsk3.json').then(res => res.json()),
          fetch('/sentences.json').then(res => res.ok ? res.json() : { 1: [], 2: [], 3: [] }),
          fetch('http://localhost:5001/get_progress').then(res => res.ok ? res.json() : null)
        ]);

        setHskData({ 1: h1, 2: h2, 3: h3 });
        setSentences(sent);
        
        if (prog) {
          setLevel(prog.level);
          // 这里我们只恢复 Level，不强制跳转 Mode，给用户选择权
          // 如果想彻底恢复到上次刷新的状态，可以在 startMode 里处理
        }
        setLoading(false);
      } catch (err) {
        setError("初始化失败，请检查后端和 JSON 文件");
        setLoading(false);
      }
    };
    initApp();
  }, []);

  // --- 2. 模式控制 ---
  
  const startMode = async (selectedMode) => {
    const rawData = selectedMode === 'reading' ? sentences[level] : hskData[level];
    if (!rawData || rawData.length === 0) return alert("暂无数据");

    // 获取上次保存的进度（针对该模式）
    let startIdx = 0;
    try {
      const res = await fetch('http://localhost:5001/get_progress');
      const prog = await res.json();
      if (prog && prog.mode === selectedMode && prog.level === level) {
        startIdx = prog.index;
      }
    } catch (e) {}

    // 如果是 Quiz 模式，依然打乱；如果是背诵模式，可以按顺序或恢复进度
    const dataList = selectedMode === 'quiz' ? [...rawData].sort(() => Math.random() - 0.5) : rawData;
    
    setShuffledWords(dataList);
    setCurrentIndex(startIdx);
    setScore(0);
    setQuizAnswers([]);
    setMode(selectedMode);
  };

  const handleIndexChange = (newIndex) => {
    setCurrentIndex(newIndex);
    saveProgress(level, mode, newIndex);
  };

  // --- 渲染 ---
  if (loading) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {mode === 'menu' && <Menu level={level} setLevel={setLevel} startMode={startMode} />}

      {mode === 'flashcard' && (
        <FlashcardMode 
          data={shuffledWords}
          currentIndex={currentIndex}
          setIndex={handleIndexChange}
          onBack={() => setMode('menu')}
          onSpeak={speakChinese}
          level={level}
        />
      )}

      {mode === 'reading' && (
        <ReadingMode 
          data={shuffledWords}
          currentIndex={currentIndex}
          setIndex={handleIndexChange}
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
            if (isCorrect && !quizAnswers[currentIndex]) setScore(s => s + 1);
            if (currentIndex < shuffledWords.length - 1) handleIndexChange(currentIndex + 1);
            else setMode('results');
          }}
          onPrev={() => handleIndexChange(currentIndex - 1)}
        />
      )}

      {mode === 'results' && (
        <Results score={score} total={shuffledWords.length} quizAnswers={quizAnswers} onRetry={() => startMode('quiz')} onMenu={() => setMode('menu')} />
      )}
    </div>
  );
}