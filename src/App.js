import React, { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
import Menu from './components/Menu';
import FlashcardMode from './components/FlashcardMode';
import ReadingMode from './components/ReadingMode';
import QuizMode from './components/QuizMode';
import Results from './components/Results';

export default function HSKStudyApp() {
  // --- 核心状态 ---
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

  // --- Edge-TTS 语音调用 ---
  const speakChinese = (text) => {
    if (window.currentAudio) {
      window.currentAudio.pause();
    }
    // 注意：请确保你的 Python 后端运行在 5001 端口
    const voice = "zh-CN-XiaoxiaoNeural";
    const audioUrl = `http://localhost:5001/tts?text=${encodeURIComponent(text)}&voice=${voice}`;
    
    const audio = new Audio(audioUrl);
    window.currentAudio = audio;
    audio.play().catch(e => {
      console.warn("TTS 播放失败，请检查后端服务是否启动:", e);
      // 备选：如果后端没开，使用浏览器自带 TTS
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'zh-CN';
      window.speechSynthesis.speak(msg);
    });
  };

  // --- 加载数据 ---
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [h1, h2, h3, sent] = await Promise.all([
          fetch('/hsk1.json').then(res => res.json()),
          fetch('/hsk2.json').then(res => res.json()),
          fetch('/hsk3.json').then(res => res.json()),
          fetch('/sentences.json').then(res => res.ok ? res.json() : { 1: [], 2: [], 3: [] })
        ]);

        setHskData({ 1: h1, 2: h2, 3: h3 });
        setSentences(sent);
        setLoading(false);
      } catch (err) {
        console.error("Data loading failed:", err);
        setError("无法加载 HSK 数据文件，请检查 public 文件夹下的 json 文件。");
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // --- 启动模式逻辑 ---
  const startMode = (selectedMode) => {
    // 根据模式选择数据源 (Reading 模式使用句子，其他使用单词)
    const rawData = selectedMode === 'reading' ? sentences[level] : hskData[level];
    
    if (!rawData || rawData.length === 0) {
      alert("当前级别暂无数据");
      return;
    }

    // 打乱数据
    const shuffled = [...rawData].sort(() => Math.random() - 0.5);
    
    setShuffledWords(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setQuizAnswers([]);
    setMode(selectedMode);
  };

  // --- 答题处理 (专门给 QuizMode 使用) ---
  const handleQuizAnswer = (isCorrect, answerObj) => {
    setQuizAnswers(prev => [...prev, answerObj]);
    if (isCorrect) setScore(prev => prev + 1);

    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setMode('results');
    }
  };

  // --- 渲染渲染 ---
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader className="animate-spin text-indigo-600 mb-4" size={48} />
      <p className="text-gray-500 font-medium">正在准备 HSK 词库...</p>
    </div>
  );

  if (error) return <div className="p-20 text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. 菜单模式 */}
      {mode === 'menu' && (
        <Menu 
          level={level} 
          setLevel={setLevel} 
          startMode={startMode} 
        />
      )}

      {/* 2. 抽卡模式 */}
      {mode === 'flashcard' && (
        <FlashcardMode 
          data={shuffledWords}
          currentIndex={currentIndex}
          setIndex={setCurrentIndex}
          onBack={() => setMode('menu')}
          onSpeak={speakChinese}
          level={level}
        />
      )}

      {/* 3. 测验模式 */}
      {mode === 'quiz' && (
          <QuizMode 
            word={shuffledWords[currentIndex]} 
            allWords={hskData[level]} 
            currentIndex={currentIndex}
            total={shuffledWords.length}
            score={score}
            onSpeak={speakChinese}
            // 之前保存过的答案，传给组件回显
            savedAnswer={quizAnswers[currentIndex]} 
            onExit={() => setMode('menu')}
            // 点击 Next 时调用
            onNext={(isCorrect, answerObj) => {
              const newAnswers = [...quizAnswers];
              newAnswers[currentIndex] = answerObj; // 保存或更新当前题目的结果
              setQuizAnswers(newAnswers);
              
              // 更新分数（仅针对新答对的情况，这里逻辑建议在 Results 计算更准，或者在此累加）
              if (isCorrect && !quizAnswers[currentIndex]) {
                setScore(prev => prev + 1);
              }

              if (currentIndex < shuffledWords.length - 1) {
                setCurrentIndex(prev => prev + 1);
              } else {
                setMode('results');
              }
            }}
            // 点击 Prev 时调用
            onPrev={() => {
              if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
            }}
          />
        )}

      {/* 4. 阅读练习模式 */}
      {mode === 'reading' && (
        <ReadingMode 
          data={shuffledWords}
          onBack={() => setMode('menu')}
          onSpeak={speakChinese}
          level={level}
        />
      )}

      {/* 5. 结果显示 */}
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