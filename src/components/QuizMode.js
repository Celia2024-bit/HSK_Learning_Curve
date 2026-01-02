import React, { useState, useEffect } from 'react';
import { Home, Volume2, ChevronRight, ChevronLeft } from 'lucide-react';

export default function QuizMode({ 
  word,          // 当前题目
  allWords,      // 完整词库（生成干扰项用）
  currentIndex,  // 当前索引
  total,         // 总数
  score,         // 实时分数
  onSpeak,       // 语音函数
  onExit,        // 返回菜单
  onNext,        // 下一步回调
  onPrev,        // 上一步回调
  savedAnswer    // 已保存的答案（用于回退显示）
}) {
  const [options, setOptions] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    // 1. 初始化选项逻辑
    if (word && allWords && allWords.length >= 4) {
      // 随机生成 3 个不重复的干扰项
      const distractors = allWords
        .filter(w => w.char !== word.char)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const newOptions = [...distractors, word].sort(() => Math.random() - 0.5);
      setOptions(newOptions);
    }

    // 2. 如果这题之前做过，恢复当时的状态
    if (savedAnswer) {
      setSelectedChar(savedAnswer.selected.char);
      setIsCorrect(savedAnswer.isCorrect);
    } else {
      setSelectedChar(null);
      setIsCorrect(null);
    }
  }, [word, allWords, savedAnswer]);

  const handleOptionClick = (option) => {
    if (selectedChar !== null) return; // 已答则锁定，不可更改

    const correct = option.char === word.char;
    setSelectedChar(option.char);
    setIsCorrect(correct);
  };

  if (!word || options.length === 0) return <div className="p-10 text-center text-gray-400">Loading Quiz...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 顶部状态栏 */}
        <header className="flex justify-between items-center mb-8">
          <button onClick={onExit} className="bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-gray-500 hover:text-purple-600 transition-all">
            EXIT
          </button>
          <div className="bg-purple-600 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-md">
            Score: {score}
          </div>
          <div className="font-bold text-indigo-900/40 font-mono">{currentIndex + 1} / {total}</div>
        </header>

        {/* 题目卡片 */}
        <div className="bg-white rounded-[2.5rem] shadow-xl p-10 mb-8 relative">
          <div className="text-center mb-10">
            <button 
              onClick={() => onSpeak(word.char)} 
              className="mb-4 p-4 bg-purple-50 text-purple-600 rounded-full hover:scale-110 transition-transform active:scale-95 shadow-sm"
            >
              <Volume2 size={32} />
            </button>
            <h2 className="text-7xl font-bold text-gray-800 mb-2">{word.char}</h2>
            <p className="text-xl text-gray-400 font-medium tracking-widest uppercase">{word.pinyin}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {options.map((option) => {
              let btnStyle = "p-6 rounded-2xl border-2 font-bold text-lg transition-all text-left flex items-center ";
              
              if (selectedChar === null) {
                btnStyle += "border-gray-100 bg-gray-50 hover:border-purple-300 hover:bg-white text-gray-700";
              } else if (option.char === word.char) {
                btnStyle += "border-green-500 bg-green-50 text-green-700 ring-4 ring-green-100";
              } else if (option.char === selectedChar && !isCorrect) {
                btnStyle += "border-red-500 bg-red-50 text-red-700";
              } else {
                btnStyle += "border-gray-50 text-gray-300 opacity-40";
              }

              return (
                <button
                  key={option.char}
                  onClick={() => handleOptionClick(option)}
                  disabled={selectedChar !== null}
                  className={btnStyle}
                >
                  <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-4 text-xs">
                    {option.char === selectedChar ? '✓' : ''}
                  </span>
                  {option.meaning}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center gap-6">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="flex-1 py-4 bg-purple-100 text-purple-700 rounded-2xl font-bold 
                       hover:bg-purple-200 active:scale-95 disabled:opacity-30 
                       disabled:bg-gray-100 disabled:text-gray-400 transition-all border border-purple-200"
          >
            PREV
          </button>

          <button
            onClick={() => onNext(isCorrect, { word, selected: options.find(o => o.char === selectedChar), isCorrect })}
            disabled={selectedChar === null}
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-lg 
                       hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
          >
            {currentIndex === total - 1 ? 'FINISH' : 'NEXT'}
          </button>
        </div>
       
      </div>
    </div>
  );
}