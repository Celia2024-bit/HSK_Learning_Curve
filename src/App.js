import React, { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
import Menu from './components/Menu';
import FlashcardMode from './components/FlashcardMode';
import ReadingMode from './components/ReadingMode';
import QuizMode from './components/QuizMode';
import Results from './components/Results';
import { speakChinese } from './utils/ttsService';

export default function HSKStudyApp() {
  // --- 1. 核心状态 ---
  const [level, setLevel] = useState(1);
  const [mode, setMode] = useState('menu');
  const [hskData, setHskData] = useState({ 1: [], 2: [], 3: [] });
  const [sentences, setSentences] = useState({ 1: [], 2: [], 3: [] });
  const [shuffledWords, setShuffledWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mastery, setMastery] = useState({}); // 存储单词熟练度 { "爱": 5, "八": 3 }
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. 持久化数据处理 (API 请求) ---

  // 保存当前学习位置 (Index) 到后端 progress.json
  const saveProgress = useCallback(async (currentLevel, currentMode, index) => {
    try {
      await fetch('http://localhost:5001/save_progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: currentLevel, mode: currentMode, index: index })
      });
    } catch (e) {
      console.warn("进度保存失败", e);
    }
  }, []);

  // 保存单词熟练度 (1-5) 到后端 mastery.json
  const updateMastery = async (char, score) => {
    // 立即更新本地 UI 状态
    setMastery(prev => ({ ...prev, [char]: score }));
    
    // 同步到后端
    try {
      await fetch('http://localhost:5001/save_mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ char, score })
      });
    } catch (e) {
      console.error("熟练度同步失败", e);
    }
  };

  // 初始化：加载所有数据、进度和熟练度
  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        const [h1, h2, h3, sent, prog, mast] = await Promise.all([
          fetch('/hsk1.json').then(res => res.json()),
          fetch('/hsk2.json').then(res => res.json()),
          fetch('/hsk3.json').then(res => res.json()),
          fetch('/sentences.json').then(res => res.ok ? res.json() : { 1: [], 2: [], 3: [] }),
          fetch('http://localhost:5001/get_progress').then(res => res.ok ? res.json() : null),
          fetch('http://localhost:5001/get_mastery').then(res => res.ok ? res.json() : {})
        ]);

        setHskData({ 1: h1, 2: h2, 3: h3 });
        setSentences(sent);
        setMastery(mast);
        
        if (prog) {
          setLevel(prog.level);
          // 可以在这里根据 prog.mode 恢复上次模式，但通常让用户从 Menu 开始更好
        }
        setLoading(false);
      } catch (err) {
        console.error("Initialization failed:", err);
        setError("无法连接后端或加载 JSON，请确保 Python app.py 已启动。");
        setLoading(false);
      }
    };
    initApp();
  }, []);

  // --- 3. 模式控制逻辑 ---

  const startMode = async (selectedMode) => {
    const rawData = selectedMode === 'reading' ? sentences[level] : hskData[level];
    if (!rawData || rawData.length === 0) return alert("当前级别数据为空");

    // 尝试恢复该模式下的进度
    let startIdx = 0;
    try {
      const res = await fetch('http://localhost:5001/get_progress');
      if (res.ok) {
        const prog = await res.json();
        if (prog && prog.mode === selectedMode && prog.level === level) {
          startIdx = prog.index;
        }
      }
    } catch (e) {}

    // Quiz 模式打乱顺序，其余模式保持顺序以匹配进度
    const dataList = selectedMode === 'quiz' ? [...rawData].sort(() => Math.random() - 0.5) : rawData;
    
    setShuffledWords(dataList);
    setCurrentIndex(startIdx);
    setScore(0);
    setQuizAnswers([]);
    setMode(selectedMode);
  };

  const handleIndexChange = (newIndex) => {
    setCurrentIndex(newIndex);
    saveProgress(level, mode, newIndex); // 自动保存进度
  };

  // --- 4. 界面渲染 ---

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader className="animate-spin text-indigo-600 mb-4" size={48} />
      <p className="text-gray-500 font-medium">正在准备 HSK 词库与同步进度...</p>
    </div>
  );

  if (error) return <div className="p-20 text-red-500 text-center font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 菜单界面 */}
      {mode === 'menu' && (
        <Menu level={level} setLevel={setLevel} startMode={startMode} />
      )}

      {/* 单词卡片模式 (支持 1-5 熟练度) */}
      {mode === 'flashcard' && (
        <FlashcardMode 
          data={shuffledWords}
          currentIndex={currentIndex}
          setIndex={handleIndexChange}
          onBack={() => setMode('menu')}
          onSpeak={speakChinese}
          level={level}
          currentMastery={mastery[shuffledWords[currentIndex]?.char] || 1}
          onUpdateMastery={updateMastery}
        />
      )}

      {/* 阅读模式 */}
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

      {/* 测验模式 */}
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

      {/* 结果结算 */}
      {mode === 'results' && (
        <Results 
          score={score} 
          total={shuffledWords.length} 
          quizAnswers={quizAnswers} 
          onRetry={() => startMode('quiz')} 
          onMenu={() => setMode('menu')} 
        />
      )}
    </div>
  );
}