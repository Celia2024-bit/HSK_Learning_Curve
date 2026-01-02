import React, { useState } from 'react';
import { Volume2, ChevronRight, ChevronLeft, Home, RotateCcw } from 'lucide-react';

export default function FlashcardMode({ data, onBack, onSpeak, level }) {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const current = data[index];

  const handleNext = () => {
    if (index < data.length - 1) {
      setIndex(index + 1);
      setShowAnswer(false);
    } else {
      onBack();
    }
  };

  if (!current) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-gray-600 hover:text-orange-600 flex items-center gap-2">
            <Home size={20}/> Menu
          </button>
          <div className="font-bold text-orange-900">HSK {level} Vocabulary</div>
          <div className="text-sm text-orange-400 font-mono">{index + 1} / {data.length}</div>
        </div>

        {/* 卡片主体 */}
        <div 
          className="bg-white rounded-3xl shadow-xl min-h-[400px] flex flex-col items-center justify-center p-10 relative cursor-pointer transition-all hover:shadow-2xl"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {/* 语音按钮 - 阻止冒泡防止触发翻转卡片 */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSpeak(current.char);
            }}
            className="absolute top-6 right-6 p-4 bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition-transform active:scale-90"
          >
            <Volume2 size={28} />
          </button>

          <div className="text-center">
            <div className="text-8xl font-bold text-gray-800 mb-4">{current.char}</div>
            <div className="text-2xl text-gray-400 font-medium mb-8">{current.pinyin}</div>
            
            <div className={`transition-all duration-300 ${showAnswer ? 'opacity-100' : 'opacity-0'}`}>
              <div className="h-px bg-gray-100 w-full my-6"></div>
              <div className="text-3xl text-orange-600 font-semibold">
                {current.meaning}
              </div>
            </div>
          </div>

          {!showAnswer && (
            <div className="absolute bottom-8 text-gray-300 text-sm animate-pulse">
              Click card to see meaning
            </div>
          )}
        </div>

        {/* 底部控制 */}
        <div className="mt-10 flex gap-4">
          <button 
            onClick={() => { setIndex(index - 1); setShowAnswer(false); }}
            disabled={index === 0}
            className="flex-1 py-4 bg-white rounded-2xl shadow-md disabled:opacity-30 font-bold text-gray-600 flex justify-center items-center"
          >
            <ChevronLeft size={24}/> Prev
          </button>
          <button 
            onClick={handleNext}
            className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl shadow-lg font-bold text-xl hover:bg-orange-600 flex justify-center items-center gap-2"
          >
            {index === data.length - 1 ? "Finish" : "Next Word"} <ChevronRight size={24}/>
          </button>
        </div>
      </div>
    </div>
  );
}