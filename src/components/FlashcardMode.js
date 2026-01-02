import React, { useState, useEffect } from 'react';
import { Volume2, Home, RotateCcw } from 'lucide-react';

export default function FlashcardMode({ 
  data, currentIndex, setIndex, onBack, onSpeak, level, 
  currentMastery, onUpdateMastery 
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const current = data[currentIndex];

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
          <button onClick={onBack} className="text-gray-500 font-bold flex items-center gap-1 hover:text-orange-600 uppercase tracking-tighter">
            <Home size={18}/> Exit
          </button>
          <div className="text-right">
            <div className="bg-orange-200 text-orange-800 px-3 py-0.5 rounded-full text-[10px] font-black mb-1 uppercase tracking-widest">
              HSK {level} • {currentIndex + 1}/{data.length}
            </div>
            <div className="flex justify-end gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`w-2 h-2 rounded-full ${s <= (currentMastery || 1) ? 'bg-orange-500' : 'bg-orange-200'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Card */}
        <div 
          onClick={() => setShowAnswer(!showAnswer)} 
          className="bg-white rounded-[3rem] shadow-2xl min-h-[400px] p-10 flex flex-col items-center justify-center relative cursor-pointer mb-6 transition-all"
        >
          <button 
            onClick={(e) => { e.stopPropagation(); onSpeak(current.char); }} 
            className="absolute top-6 right-6 p-4 bg-orange-50 text-orange-500 rounded-2xl hover:bg-orange-500 hover:text-white transition-all"
          >
            <Volume2 size={28} />
          </button>
          <div className="text-center">
            <h2 className="text-8xl font-bold text-gray-800 mb-4">{current.char}</h2>
            <p className="text-2xl text-gray-400 font-mono mb-8">{current.pinyin}</p>
            <div className={`transition-all duration-500 ${showAnswer ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <p className="text-4xl text-orange-600 font-black uppercase">{current.meaning}</p>
            </div>
          </div>
          {!showAnswer && (
            <div className="absolute bottom-10 text-orange-200 font-bold text-sm flex items-center gap-2 animate-pulse">
              <RotateCcw size={14}/> CLICK TO FLIP
            </div>
          )}
        </div>

        {/* Mastery Selector */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 mb-6 shadow-sm border border-white">
          <p className="text-center text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Mastery Level</p>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map(score => (
              <button 
                key={score} 
                onClick={(e) => { e.stopPropagation(); onUpdateMastery(current.char, score); }} 
                className={`flex-1 py-3 rounded-xl font-black transition-all ${ (currentMastery || 1) === score ? 'bg-orange-600 text-white shadow-lg scale-105' : 'bg-white text-orange-300 border border-orange-100' }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0} 
            className="flex-1 py-4 bg-orange-100 text-orange-700 rounded-2xl font-bold disabled:opacity-30 disabled:bg-gray-100 disabled:text-gray-400 transition-all"
          >
            PREV
          </button>
          <button 
            onClick={handleNext} 
            className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-bold text-xl shadow-xl hover:bg-orange-600 active:scale-95 transition-all"
          >
            {currentIndex === data.length - 1 ? "FINISH" : "NEXT"}
          </button>
        </div>
      </div>
    </div>
  );
}