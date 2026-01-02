import React, { useState, useEffect } from 'react';
import { Volume2, Home } from 'lucide-react';

export default function QuizMode({ 
  word, allWords, currentIndex, total, score, 
  onSpeak, onExit, onNext, onPrev, savedAnswer 
}) {
  const [options, setOptions] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);

  useEffect(() => {
    if (word && allWords.length >= 4) {
      // Pick 3 distractors
      const distractors = allWords
        .filter(w => w.char !== word.char)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      // Merge and shuffle
      setOptions([...distractors, word].sort(() => Math.random() - 0.5));
    }
    // Restore state if returning to this card
    setSelectedChar(savedAnswer?.selected?.char || null);
  }, [word, allWords, savedAnswer]);

  const handleOptionClick = (char) => {
    if (savedAnswer) return; // Prevent changing answer after submission
    setSelectedChar(char);
  };

  const handleSubmit = () => {
    const isCorrect = selectedChar === word.char;
    onNext(isCorrect, { 
      word, 
      selected: options.find(o => o.char === selectedChar), 
      isCorrect 
    });
  };

  if (!word) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <button onClick={onExit} className="bg-white px-4 py-2 rounded-lg font-bold text-gray-400 hover:text-purple-600 uppercase text-xs transition-colors">
            Exit
          </button>
          <div className="bg-purple-600 text-white px-5 py-1.5 rounded-full text-xs font-black shadow-md uppercase tracking-widest">
            Score: {score}
          </div>
          <div className="font-bold text-indigo-900/40 text-xs">
            {currentIndex + 1} / {total}
          </div>
        </header>

        {/* Question Area */}
        <div className="bg-white rounded-[2.5rem] shadow-xl p-10 mb-8 text-center relative">
          <button 
            onClick={() => onSpeak(word.char)} 
            className="mb-6 p-5 bg-purple-50 text-purple-600 rounded-full hover:scale-110 transition-transform shadow-inner"
          >
            <Volume2 size={40} />
          </button>
          <h2 className="text-7xl font-bold text-gray-800 mb-2">{word.char}</h2>
          <p className="text-xl text-gray-300 font-mono mb-8 tracking-widest">{word.pinyin}</p>
          
          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {options.map((opt, i) => {
              const isSelected = selectedChar === opt.char;
              const isCorrectAnswer = opt.char === word.char;
              
              let btnClass = "bg-white border-gray-100 text-gray-600 hover:border-purple-200";
              if (isSelected) {
                btnClass = isCorrectAnswer ? "bg-green-500 border-green-500 text-white" : "bg-red-500 border-red-500 text-white";
              } else if (savedAnswer && isCorrectAnswer) {
                btnClass = "bg-green-100 border-green-500 text-green-700";
              }

              return (
                <button 
                  key={i} 
                  onClick={() => handleOptionClick(opt.char)}
                  className={`p-5 rounded-2xl text-lg font-bold transition-all border-2 ${btnClass}`}
                >
                  {opt.meaning}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex gap-4">
          <button 
            onClick={onPrev} 
            disabled={currentIndex === 0} 
            className="flex-1 py-4 bg-purple-100 text-purple-700 rounded-2xl font-bold disabled:opacity-30 disabled:bg-gray-100 transition-all border border-purple-200"
          >
            PREV
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedChar} 
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {currentIndex === total - 1 ? 'FINISH' : 'NEXT'}
          </button>
        </div>
      </div>
    </div>
  );
}