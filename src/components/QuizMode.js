import React, { useState, useEffect } from 'react';
import { Home, Volume2, ChevronRight, ChevronLeft } from 'lucide-react';

export default function QuizMode({ 
  word, allWords, currentIndex, total, score, 
  onExit, onSpeak, onNext, onPrev, savedAnswer 
}) {
  const [options, setOptions] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    // 1. 如果这题之前做过，直接恢复状态
    if (savedAnswer) {
      // 恢复当时生成的选项列表，或者重新生成但标记已选
      // 为了体验一致，建议在 App.js 级别持久化 options，但这里我们简单处理：
      setSelectedChar(savedAnswer.selected.char);
      setIsCorrect(savedAnswer.isCorrect);
    } else {
      setSelectedChar(null);
      setIsCorrect(null);
    }

    // 2. 生成选项
    if (word && allWords && allWords.length >= 4) {
      const distractors = allWords
        .filter(w => w.char !== word.char)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const newOptions = [...distractors, word].sort(() => Math.random() - 0.5);
      setOptions(newOptions);
    }
  }, [word, allWords, savedAnswer]);

  const handleOptionClick = (option) => {
    if (selectedChar !== null) return; // 已有答案则锁定
    const correct = option.char === word.char;
    setSelectedChar(option.char);
    setIsCorrect(correct);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <button onClick={onExit} className="bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-gray-400 hover:text-purple-600 transition-all">
            EXIT
          </button>
          <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
            Score: {score}
          </div>
          <div className="font-bold text-gray-500">{currentIndex + 1} / {total}</div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-xl p-10 mb-6 relative">
          <div className="text-center mb-8">
            <button onClick={() => onSpeak(word.char)} className="mb-4 p-4 bg-purple-50 text-purple-600 rounded-full hover:scale-110 transition-transform">
              <Volume2 size={32} />
            </button>
            <h2 className="text-7xl font-bold text-gray-800 mb-2">{word.char}</h2>
            <p className="text-xl text-gray-400 font-medium">{word.pinyin}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {options.map((option) => {
              let btnStyle = "p-5 rounded-2xl border-2 font-bold text-lg transition-all text-left ";
              if (selectedChar === null) {
                btnStyle += "border-gray-100 bg-gray-50 hover:border-purple-400";
              } else if (option.char === word.char) {
                btnStyle += "border-green-500 bg-green-50 text-green-700";
              } else if (option.char === selectedChar && !isCorrect) {
                btnStyle += "border-red-500 bg-red-50 text-red-700";
              } else {
                btnStyle += "border-gray-50 text-gray-300 opacity-50";
              }

              return (
                <button
                  key={option.char}
                  onClick={() => handleOptionClick(option)}
                  className={btnStyle}
                >
                  {option.meaning}
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部导航 */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="flex-1 py-4 bg-white/80 rounded-2xl font-bold text-gray-500 disabled:opacity-30 hover:bg-white transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={24} /> Prev
          </button>

          <button
            onClick={() => onNext(isCorrect, { word, selected: options.find(o => o.char === selectedChar), isCorrect })}
            disabled={selectedChar === null}
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-lg disabled:opacity-50 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            {currentIndex === total - 1 ? 'Finish' : 'Next'} <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}