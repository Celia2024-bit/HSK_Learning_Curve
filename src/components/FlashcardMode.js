import React, { useState, useEffect } from 'react';
import { Volume2, ChevronRight, ChevronLeft, Home, RotateCcw } from 'lucide-react';

export default function FlashcardMode({ data, currentIndex, setIndex, onBack, onSpeak, level }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const current = data[currentIndex];

  // 每次切换单词时，自动隐藏答案
  useEffect(() => {
    setShowAnswer(false);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setIndex(currentIndex + 1);
    } else {
      onBack();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIndex(currentIndex - 1);
    }
  };

  if (!current) return <div className="p-20 text-center">No data found...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-6 flex flex-col items-center">
      <div className="max-w-xl w-full">
        {/* 顶部导航 */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-gray-500 font-bold flex items-center gap-1 hover:text-orange-600 transition-colors">
            <Home size={18}/> EXIT
          </button>
          <div className="bg-orange-200 text-orange-800 px-4 py-1 rounded-full text-xs font-black shadow-sm">
            HSK {level} • {currentIndex + 1} / {data.length}
          </div>
        </div>

        {/* 单词卡片 */}
        <div 
          onClick={() => setShowAnswer(!showAnswer)}
          className="bg-white rounded-[3rem] shadow-2xl min-h-[450px] p-12 flex flex-col items-center justify-center relative cursor-pointer group transition-transform active:scale-[0.98]"
        >
          <button 
            onClick={(e) => { e.stopPropagation(); onSpeak(current.char); }}
            className="absolute top-8 right-8 p-4 bg-orange-50 text-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-inner"
          >
            <Volume2 size={32} />
          </button>

          <div className="text-center">
            <h2 className="text-9xl font-bold text-gray-800 mb-4">{current.char}</h2>
            <p className="text-3xl text-gray-400 font-mono mb-10 tracking-tighter">{current.pinyin}</p>
            
            <div className={`transition-all duration-500 transform ${showAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="h-px bg-orange-100 w-24 mx-auto mb-8"></div>
              <p className="text-4xl text-orange-600 font-black">{current.meaning}</p>
            </div>
          </div>

          {!showAnswer && (
            <div className="absolute bottom-10 text-orange-200 font-bold text-sm flex items-center gap-2">
              <RotateCcw size={14}/> CLICK TO FLIP
            </div>
          )}
        </div>

        {/* 底部控制 */}
        <div className="mt-8 flex gap-4">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0} 
            className="flex-1 py-4 bg-white/80 backdrop-blur rounded-2xl font-bold text-gray-400 disabled:opacity-30 shadow-md hover:bg-white transition-all"
          >
            PREV
          </button>
          <button 
            onClick={handleNext} 
            className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-orange-600 transition-all"
          >
            {currentIndex === data.length - 1 ? "FINISH" : "NEXT"}
          </button>
        </div>
      </div>
    </div>
  );
}