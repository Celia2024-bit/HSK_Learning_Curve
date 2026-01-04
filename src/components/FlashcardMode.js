import React, { useState, useEffect } from 'react';
import { Volume2, Home } from 'lucide-react';

export default function FlashcardMode({ 
  data, currentIndex, setIndex, onBack, onSpeak, level, 
  currentMastery, onUpdateMastery 
}) {
  /**
   * 状态循环定义：
   * 0: Just Hanzi (仅中文)
   * 1: Just Pinyin (仅拼音)
   * 2: Just Meaning (仅英文)
   * 3: All Together (全部显示)
   */
  const [step, setStep] = useState(0);
  const current = data[currentIndex];

  // 当切换单词时，重置回第 0 步 (仅中文)
  useEffect(() => {
    setStep(0);
  }, [currentIndex]);

  const handleCardClick = () => {
    // 0 -> 1 -> 2 -> 3 -> 0 循环
    setStep((prev) => (prev + 1) % 4);
  };

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
            <span className="text-[10px] font-black text-orange-400 block tracking-widest uppercase">HSK {level}</span>
            <span className="text-sm font-black text-slate-700">{currentIndex + 1} / {data.length}</span>
          </div>
        </div>

        {/* Main Flashcard Card */}
        <div 
          onClick={handleCardClick}
          className="bg-white rounded-[3rem] shadow-2xl shadow-orange-200/50 p-12 mb-8 min-h-[400px] flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 border-b-8 border-orange-200 relative"
        >
          {/* 1. 中文内容: 只有 step 为 0 或 3 的时候显示 */}
          {(step === 0 || step === 3) && (
            <h2 className="text-8xl font-black text-slate-800 mb-6 tracking-tighter animate-in fade-in duration-300">
              {current.char}
            </h2>
          )}

          {/* 2. 拼音内容: 只有 step 为 1 或 3 的时候显示 */}
          {(step === 1 || step === 3) && (
            <p className="text-4xl font-bold text-orange-500 mb-4 tracking-widest animate-in slide-in-from-bottom-2 duration-300">
              {current.pinyin}
            </p>
          )}

          {/* 3. 英文内容: 只有 step 为 2 或 3 的时候显示 */}
          {(step === 2 || step === 3) && (
            <p className="text-2xl font-medium text-slate-500 italic px-6 animate-in zoom-in-95 duration-300">
              {current.meaning}
            </p>
          )}

          {/* 发音按钮 */}
          <button 
            onClick={(e) => { e.stopPropagation(); onSpeak(current.char, true); }}
            className="mt-10 w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 hover:bg-orange-600 transition-colors"
          >
            <Volume2 size={32} />
          </button>
          
          {/* 指示说明 */}
          <p className="absolute bottom-6 text-[9px] font-bold text-gray-300 uppercase tracking-[0.3em]">
            {step === 0 && "Step 1: Hanzi (Tap for Pinyin)"}
            {step === 1 && "Step 2: Pinyin (Tap for Meaning)"}
            {step === 2 && "Step 3: Meaning (Tap for All)"}
            {step === 3 && "Step 4: Summary (Tap to Reset)"}
          </p>
        </div>

        {/* Mastery Selection */}
        <div className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-6 shadow-sm border border-white mb-6">
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
            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all"
          >
            {currentIndex === data.length - 1 ? 'FINISH' : 'NEXT WORD'}
          </button>
        </div>
      </div>
    </div>
  );
}