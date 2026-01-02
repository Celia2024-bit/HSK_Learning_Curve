import React, { useState } from 'react';
import { Volume2, ChevronRight, ChevronLeft, Home, Eye } from 'lucide-react';

export default function ReadingMode({ data, currentIndex, setIndex, onBack, onSpeak, level }) {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <header className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-gray-500 font-bold flex items-center gap-1">
            <Home size={18}/> EXIT
          </button>
          <div className="text-indigo-900 font-bold">HSK {level} READING • {currentIndex + 1}/{data.length}</div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-xl p-12 relative min-h-[400px] flex flex-col justify-center">
          <button 
            onClick={() => onSpeak(current.chinese)}
            className="absolute top-8 right-8 p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"
          >
            <Volume2 size={32} />
          </button>

          <div className="mb-10">
            <h2 className="text-5xl font-medium text-gray-800 leading-relaxed mb-4">{current.chinese}</h2>
            <p className="text-xl text-gray-400 font-mono tracking-wide">{current.pinyin}</p>
          </div>

          <div className={`p-6 rounded-2xl bg-indigo-50 transition-all ${showAnswer ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-2xl text-indigo-900 font-bold">{current.english}</p>
          </div>

          {!showAnswer && (
            <button 
              onClick={() => setShowAnswer(true)}
              className="mt-6 flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-600"
            >
              <Eye size={20}/> SHOW TRANSLATION
            </button>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 flex gap-4">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0} 
            className="flex-1 py-5 bg-indigo-100 text-indigo-700 rounded-2xl font-bold 
                       hover:bg-indigo-200 active:scale-95 disabled:opacity-30 disabled:bg-gray-100 
                       disabled:text-gray-400 border border-indigo-200 transition-all"
          >
            PREV
          </button>
          <button 
            onClick={handleNext} 
            className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-lg 
                       hover:bg-indigo-700 active:scale-95 transition-all"
          >
            {currentIndex === data.length - 1 ? "FINISH" : "NEXT"}
          </button>
        </div>
      </div>
    </div>
  );
}