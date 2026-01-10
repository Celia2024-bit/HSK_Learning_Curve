import React, { useState, useEffect } from 'react';
import { Volume2, Home } from 'lucide-react';

export default function QuizMode({ 
  word, 
  quizPool, 
  currentIndex, 
  total, 
  score, 
  onSpeak, 
  onExit, 
  onNext, 
  onPrev, 
  savedAnswer 
}) {
  // 直接使用 State 存储当前题目的选项
  const [currentOptions, setCurrentOptions] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [showUserResult, setShowUserResult] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // 监听 word 的变化，一旦换题，立即初始化本题的一切
  useEffect(() => {
    if (!word) return;

    if (savedAnswer && savedAnswer.allOptions) {
      // 如果有保存过的记录（比如 PREV 回来的），恢复它
      setCurrentOptions(savedAnswer.allOptions);
      setSelectedChar(savedAnswer.selected?.char || null);
      setShowUserResult(true);
      setShowCorrectAnswer(true);
    } else {
      // 否则，为新题生成干扰项
      const pool = (quizPool && quizPool.length > 4) ? quizPool : [word]; // 安全检查
      const distractors = pool
        .filter(w => w.char !== word.char)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const newOptions = [...distractors, word].sort(() => Math.random() - 0.5);
      
      setCurrentOptions(newOptions);
      setSelectedChar(null);
      setShowUserResult(false);
      setShowCorrectAnswer(false);
    }
  }, [word?.char]); // 只在“字”变了的时候才重新生成选项

  const handleOptionClick = (char) => {
    if (showUserResult || currentOptions.length === 0) return; 

    setSelectedChar(char);
    setShowUserResult(true); 

    const isCorrect = char === word.char;

    // 延迟逻辑
    if (!isCorrect) {
      setTimeout(() => setShowCorrectAnswer(true), 250);
    } else {
      setShowCorrectAnswer(true);
    }

    // 将当前选项存入 answerData 传回给 App.js
    onNext(isCorrect, { 
      word, 
      selected: currentOptions.find(o => o.char === char), 
      allOptions: currentOptions, // 这一步非常重要，保证了 PREV 回来时选项还在
      isCorrect 
    }, false); 
  };

  // 如果还没准备好，显示个简单的占位
  if (!word || currentOptions.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100">
      {/* 顶部状态栏 */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-2xl transition-colors"
        >
          <Home size={18} className="text-gray-400" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Back to Menu</span>
        </button>
        <div className="text-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question</span>
          <div className="text-2xl font-black text-indigo-600">{currentIndex + 1} / {total}</div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Score</span>
          <div className="text-2xl font-black text-green-500">{score}</div>
        </div>
      </div>

      {/* 题目展示 */}
      <div className="text-center mb-10">
        <div className="inline-block p-8 rounded-[3rem] bg-indigo-50 mb-6 relative">
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

      {/* 选项网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {currentOptions.map((opt, i) => {
          const isCorrectAnswer = opt.char === word.char; 
          const isThisSelected = selectedChar === opt.char;

          let btnClass = "bg-white border-gray-200 text-gray-700 hover:border-indigo-300";

          if (showUserResult) {
            if (isThisSelected) {
              btnClass = isCorrectAnswer ? "bg-green-500 border-green-500 text-white" : "bg-red-500 border-red-500 text-white";
            } else if (showCorrectAnswer && isCorrectAnswer) {
              btnClass = "bg-green-500 border-green-500 text-white shadow-lg";
            } else {
              btnClass = "bg-gray-50 border-gray-100 text-gray-300 opacity-50";
            }
          }

          return (
            <button 
              key={`${word.char}-${i}`} 
              onClick={() => handleOptionClick(opt.char)}
              disabled={showUserResult}
              className={`p-5 rounded-2xl text-lg font-bold transition-all duration-300 border-2 text-left px-8 ${btnClass}`}
            >
              {opt.meaning}
            </button>
          );
        })}
      </div>

      {/* 底部按钮 */}
      <div className="flex gap-4">
        <button 
          onClick={onPrev} 
          disabled={currentIndex === 0} 
          className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold"
        >
          PREV
        </button>
        <button 
          onClick={() => onNext(selectedChar === word.char, null, true)} 
          disabled={!showUserResult} 
          className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {currentIndex === total - 1 ? 'FINISH' : 'NEXT'}
        </button>
      </div>
    </div>
  );
}