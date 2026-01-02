import React, { useState } from 'react';
import { Volume2, ChevronRight, ChevronLeft, Home } from 'lucide-react';

export default function ReadingMode({ data, onBack, onSpeak, level }) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-indigo-600">
          <Home size={20}/> Back to Menu
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-10 relative overflow-hidden">
          {/* Edge-TTS 按钮 */}
          <button 
            onClick={() => onSpeak(current.chinese)}
            className="absolute top-6 right-6 p-4 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-all"
          >
            <Volume2 size={32} />
          </button>

          <div className="text-center py-10">
            <h2 className="text-5xl font-bold text-gray-800 mb-10 leading-snug">
              {current.chinese}
            </h2>

            {showAnswer ? (
              <p className="text-2xl text-indigo-600 animate-fade-in font-medium">
                {current.english}
              </p>
            ) : (
              <button 
                onClick={() => setShowAnswer(true)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-indigo-700 transition-transform active:scale-95"
              >
                Show Meaning
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button 
            onClick={() => { setIndex(index - 1); setShowAnswer(false); }}
            disabled={index === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl disabled:opacity-30"
          >
            <ChevronLeft /> Previous
          </button>
          <span className="font-bold text-gray-500">{index + 1} / {data.length}</span>
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl"
          >
            {index === data.length - 1 ? "Finish" : "Next"} <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}