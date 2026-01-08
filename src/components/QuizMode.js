import React, { useState, useEffect } from 'react';
import { Volume2, Home } from 'lucide-react';

export default function QuizMode({ 
  word, 
  quizPool, // 替换原来的 allWords，只传当前级别的词库或 quizQueue
  currentIndex, 
  total, 
  score, 
  onSpeak, 
  onExit, 
  onNext, 
  onPrev, 
  savedAnswer 
}) {
  const [options, setOptions] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);

  useEffect(() => {
    // 简化生成选项的逻辑
    if (word && quizPool && quizPool.length >= 4) {
      // 1. 从 pool 中选出干扰项 (排除当前正确单词)
      const distractors = quizPool
        .filter(w => w.char !== word.char)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      // 2. 合并并随机排序
      setOptions([...distractors, word].sort(() => Math.random() - 0.5));
    }
    
    // 恢复已保存的状态 (如果用户点击 PREV 回来)
    setSelectedChar(savedAnswer?.selected?.char || null);
  }, [word, quizPool, savedAnswer]);

  const handleOptionClick = (char) => {
    if (savedAnswer) return; 
    setSelectedChar(char);
  };

  const handleSubmit = () => {
    const isCorrect = selectedChar === word.char;
    onNext(isCorrect, { 
      word, 
      selected: options.find(o => o.char === selectedChar), 
      isCorrect 
    });
  };

  if (!word) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onExit} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
          <Home size={28} className="text-gray-400" />
        </button>
        <div className="text-center">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Question</span>
          <div className="text-2xl font-black text-indigo-600">{currentIndex + 1} / {total}</div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Score</span>
          <div className="text-2xl font-black text-green-500">{score}</div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="text-center mb-10">
        <div className="inline-block p-8 rounded-[3rem] bg-indigo-50 mb-6 relative group">
          <div className="text-8xl font-black text-indigo-900 mb-2">{word.char}</div>
          <button 
            onClick={() => onSpeak(word.char, false)}
            className="absolute -right-4 -bottom-4 p-4 bg-white shadow-xl rounded-2xl text-indigo-600 hover:scale-110 transition-transform border border-indigo-100"
          >
            <Volume2 size={32} fill="currentColor" />
          </button>
        </div>
        <div className="text-2xl text-gray-400 font-medium italic">{word.pinyin}</div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {options.map((opt, i) => {
          const isSelected = selectedChar === opt.char;
          const isCorrectAnswer = opt.char === word.char;
          
          let btnClass = "bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50";
          
          if (savedAnswer) {
            // 已提交状态的颜色显示
            if (isSelected) {
              btnClass = isCorrectAnswer ? "bg-green-500 border-green-500 text-white" : "bg-red-500 border-red-500 text-white";
            } else if (isCorrectAnswer) {
              btnClass = "bg-green-100 border-green-500 text-green-700";
            }
          } else if (isSelected) {
            btnClass = "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200";
          }

          return (
            <button 
              key={i} 
              onClick={() => handleOptionClick(opt.char)}
              disabled={!!savedAnswer}
              className={`p-5 rounded-2xl text-lg font-bold transition-all border-2 text-left px-8 ${btnClass}`}
            >
              {opt.meaning}
            </button>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="flex gap-4">
        <button 
          onClick={onPrev} 
          disabled={currentIndex === 0} 
          className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold disabled:opacity-30 transition-all"
        >
          PREV
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!selectedChar || !!savedAnswer} 
          className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
        >
          {currentIndex === total - 1 ? 'FINISH' : 'NEXT'}
        </button>
      </div>
    </div>
  );
}