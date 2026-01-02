import React, { useState } from 'react';
import { Volume2, ChevronRight, ChevronLeft, Home, RotateCcw } from 'lucide-react';

export default function FlashcardMode({ data, currentIndex, setIndex, onBack, onSpeak, level }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const current = data[currentIndex];

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      onBack();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  if (!current) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <div className="max-w-xl mx-auto">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-gray-500 hover:text-orange-600 font-bold flex items-center gap-1">
            <Home size={18}/> MENU
          </button>
          <div className="px-4 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-black">
            HSK {level} • {currentIndex + 1} / {data.length}
          </div>
        </div>

        {/* 大卡片 */}
        <div 
          onClick={() => setShowAnswer(!showAnswer)}
          className="bg-white rounded-[3rem] shadow-2xl min-h-[450px] p-12 flex flex-col items-center justify-center relative cursor-pointer group transition-all duration-500 hover:translate-y-[-4px]"
        >
          {/* 发音按钮 - 使用 stopPropagation 防止点喇叭也翻转卡片 */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSpeak(current.char);
            }}
            className="absolute top-8 right-8 p-5 bg-orange-50 text-orange-500 rounded-3xl hover:bg-orange-500 hover:text-white transition-all shadow-sm"
          >
            <Volume2 size={32} />
          </button>

          <div className="text-center">
            <div className="text-9xl font-bold text-gray-800 mb-6 transition-transform group-hover:scale-105">
              {current.char}
            </div>
            <div className="text-3xl text-gray-400 font-medium font-mono mb-10">
              {current.pinyin}
            </div>
            
            <div className={`transition-all duration-500 transform ${showAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="h-0.5 bg-orange-100 w-24 mx-auto mb-8"></div>
              <div className="text-4xl text-orange-600 font-black">
                {current.meaning}
              </div>
            </div>
          </div>

          {!showAnswer && (
            <div className="absolute bottom-10 flex items-center gap-2 text-orange-300 font-bold text-sm animate-pulse">
              <RotateCcw size={16} /> CLICK TO REVEAL
            </div>
          )}
        </div>

        {/* 底部导航 */}
        <div className="mt-10 flex gap-4">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-5 bg-white rounded-2xl shadow-lg disabled:opacity-30 text-gray-500 font-bold flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={24}/> PREV
          </button>
          <button 
            onClick={handleNext}
            className="flex-[2] py-5 bg-orange-500 text-white rounded-2xl shadow-xl font-bold text-xl hover:bg-orange-600 flex justify-center items-center gap-2 transition-all active:scale-95"
          >
            {currentIndex === data.length - 1 ? "FINISH" : "NEXT WORD"} <ChevronRight size={24}/>
          </button>
        </div>
      </div>
    </div>
  );
}