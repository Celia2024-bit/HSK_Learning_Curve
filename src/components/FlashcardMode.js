import React, { useState, useEffect } from 'react';
import { Volume2, ChevronRight, ChevronLeft, Home, RotateCcw } from 'lucide-react';

export default function FlashcardMode({ 
  data, currentIndex, setIndex, onBack, onSpeak, level, 
  currentMastery, onUpdateMastery 
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const current = data[currentIndex];

  // Reset answer visibility when moving to next/prev word
  useEffect(() => {
    setShowAnswer(false);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < data.length - 1) setIndex(currentIndex + 1);
    else onBack();
  };

  const handlePrev = () => {
    if (currentIndex > 0) setIndex(currentIndex - 1);
  };

  if (!current) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-6 flex flex-col items-center">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-gray-500 font-bold flex items-center gap-1 hover:text-orange-600 transition-colors">
            <Home size={18}/> EXIT
          </button>
          <div className="flex flex-col items-end">
             <div className="bg-orange-200 text-orange-800 px-3 py-0.5 rounded-full text-[10px] font-black mb-1">
                HSK {level} • {currentIndex + 1} / {data.length}
             </div>
             {/* Proficiency Dots Indicator */}
             <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <div 
                    key={s} 
                    className={`w-2 h-2 rounded-full ${s <= (currentMastery || 1) ? 'bg-orange-500' : 'bg-orange-200'}`} 
                  />
                ))}
             </div>
          </div>
        </div>

        {/* Word Card */}
        <div 
          onClick={() => setShowAnswer(!showAnswer)}
          className="bg-white rounded-[3rem] shadow-2xl min-h-[400px] p-10 flex flex-col items-center justify-center relative cursor-pointer mb-6"
        >
          <button 
            onClick={(e) => { e.stopPropagation(); onSpeak(current.char); }}
            className="absolute top-6 right-6 p-4 bg-orange-50 text-orange-500 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-sm"
          >
            <Volume2 size={28} />
          </button>

          <div className="text-center">
            <h2 className="text-8xl font-bold text-gray-800 mb-4">{current.char}</h2>
            <p className="text-2xl text-gray-400 font-mono mb-8">{current.pinyin}</p>
            
            <div className={`transition-all duration-500 ${showAnswer ? 'opacity-100 scale-100' : 'opacity-0 scale-95 translate-y-4'}`}>
              <div className="h-px bg-orange-100 w-20 mx-auto mb-6"></div>
              <p className="text-4xl text-orange-600 font-black tracking-tight">{current.meaning}</p>
            </div>
          </div>

          {!showAnswer && (
            <div className="absolute bottom-10 text-orange-200 font-bold text-sm flex items-center gap-2 animate-pulse">
              <RotateCcw size={14}/> CLICK TO FLIP
            </div>
          )}
        </div>

        {/* Mastery Setting Area */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 mb-6 shadow-sm border border-white">
          <p className="text-center text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Mastery Level</p>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateMastery(current.char, score);
                }}
                className={`flex-1 py-3 rounded-xl font-black transition-all transform active:scale-90 ${
                  (currentMastery || 1) === score 
                  ? 'bg-orange-600 text-white shadow-lg scale-105' 
                  : 'bg-white text-orange-300 hover:bg-orange-50 border border-orange-100'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
          <div className="flex justify-between px-1 mt-3">
            <span className="text-[9px] text-gray-400 font-black uppercase">Newbie</span>
            <span className="text-[9px] text-gray-400 font-black uppercase">Mastered</span>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex gap-4">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0} 
            className="flex-1 py-4 bg-white/80 rounded-2xl font-bold text-gray-400 disabled:opacity-30 shadow-sm hover:bg-white transition-all"
          >
            PREV
          </button>
          <button 
            onClick={handleNext} 
            className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-bold text-xl shadow-xl hover:bg-orange-600 transition-all active:scale-[0.98]"
          >
            {currentIndex === data.length - 1 ? "FINISH" : "NEXT"}
          </button>
        </div>
      </div>
    </div>
  );
}