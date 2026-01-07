import React, { useState, useEffect } from 'react';
import { Volume2, Home, ArrowLeft, ArrowRight, List, X } from 'lucide-react';

export default function FlashcardMode({ 
  data, currentIndex, setIndex, onBack, onSpeak, level, 
  currentMastery, onUpdateMastery 
}) {
  const [step, setStep] = useState(0);
  const [showWordList, setShowWordList] = useState(false); // 控制单词列表显示/隐藏
  const current = data[currentIndex];

  useEffect(() => {
    setStep(0);
  }, [currentIndex]);

  const handleCardClick = () => {
    setStep((prev) => (prev + 1) % 4);
  };

  const handleNext = () => {
    if (currentIndex < data.length - 1) setIndex(currentIndex + 1);
    else onBack();
  };

  const handlePrev = () => {
    if (currentIndex > 0) setIndex(currentIndex - 1);
  };

  // 跳转到指定单词
  const jumpToWord = (index) => {
    setIndex(index);
    setShowWordList(false); // 跳转后关闭列表
  };

  if (!current) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-800 p-6 flex flex-col items-center font-sans relative">
      {/* 单词列表弹窗 */}
      {showWordList && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* 列表头部 */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">HSK Level {level} 单词列表</h3>
              <button 
                onClick={() => setShowWordList(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 单词列表内容 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {data.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => jumpToWord(index)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      currentIndex === index
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-black text-lg">{word.char}</div>
                    <div className="text-xs text-slate-400 mt-1">{word.pinyin}</div>
                    <div className="text-xs text-slate-500 italic mt-0.5 truncate">{word.meaning}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* 列表底部 */}
            <div className="p-4 border-t border-slate-100 flex justify-center">
              <span className="text-xs text-slate-400 font-bold">
                共 {data.length} 个单词 | 当前第 {currentIndex + 1} 个
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full flex flex-col h-full">
        {/* Header - 新增单词列表按钮 */}
        <div className="flex justify-between items-center mb-8 px-2">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all border border-white">
            <Home size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">HSK Level {level}</div>
              <div className="text-sm font-black text-slate-600">
                {currentIndex + 1} <span className="text-slate-200 mx-0.5">/</span> {data.length}
              </div>
            </div>
            
            {/* 单词列表按钮 */}
            <button 
              onClick={() => setShowWordList(true)}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all border border-white"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* 核心卡片 */}
        <div 
          onClick={handleCardClick}
          className="relative bg-white rounded-[3.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.04)] border border-white p-10 min-h-[480px] flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-[0.98] overflow-hidden"
        >
          <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
            {/* Step 0: 汉字 - 渐变色 */}
            {step === 0 && (
              <h2 className="text-7xl font-black bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-in fade-in zoom-in-95 duration-500 uppercase">
                {current.char}
              </h2>
            )}

            {/* Step 1: 拼音 - 翡翠绿 (纯色原版) */}
            {step === 1 && (
              <p className="text-7xl font-bold text-emerald-500 animate-in slide-in-from-bottom-8 duration-500 font-sans tracking-tight">
                {current.pinyin}
              </p>
            )}

            {/* Step 2: 英文 - 渐变色 */}
            {step === 2 && (
              <p className="text-6xl font-black bg-gradient-to-br from-orange-400 to-rose-500 bg-clip-text text-transparent animate-in fade-in duration-500 px-2 leading-tight">
                {current.meaning}
              </p>
            )}

            {/* Step 3: 总结 - 汉字巨化 + 你满意的渐变色 */}
            {step === 3 && (
              <div className="flex flex-col items-center animate-in fade-in zoom-in-90 duration-500">
                <h2 className="text-[10rem] font-black bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 tracking-tighter">
                  {current.char}
                </h2>
                <p className="text-4xl font-bold text-emerald-500 mb-2 font-sans">
                  {current.pinyin}
                </p>
                <p className="text-xl font-bold text-slate-300 italic tracking-widest uppercase">
                  {current.meaning}
                </p>
              </div>
            )}
          </div>

          {/* 发音按钮 */}
          <button 
            onClick={(e) => { e.stopPropagation(); onSpeak(current.char, true); }}
            className="mt-8 relative group"
          >
            <div className="relative w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90">
              <Volume2 size={28} />
            </div>
          </button>
        </div>

        {/* 底部掌握度按钮 */}
        <div className="mt-4 px-2">
          <div className="flex bg-slate-200/50 p-1.5 rounded-[2rem] gap-1 border border-slate-200/50">
            {[1, 2, 3, 4, 5].map(score => (
              <button 
                key={score} 
                onClick={(e) => { e.stopPropagation(); onUpdateMastery(current.char, score); }} 
                className={`flex-1 py-3.5 rounded-2xl text-xs font-black transition-all ${ 
                  (currentMastery || 1) === score 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-600' 
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* 底部导航: PREV & NEXT 均等化设计 */}
        <div className="mt-auto pt-8 flex gap-4 px-2">
          {/* PREV: 换成了深灰色背景，与 NEXT 形成明显的深浅层级 */}
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0} 
            className="flex-1 h-16 bg-slate-200 text-slate-700 rounded-[2rem] font-black text-xs tracking-widest disabled:opacity-30 disabled:bg-slate-100 disabled:text-slate-300 hover:bg-slate-300 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} strokeWidth={3} />
            PREV
          </button>

          {/* NEXT: 保持最强的黑色/蓝色渐变 */}
          <button 
            onClick={handleNext} 
            className="flex-1 h-16 bg-slate-900 text-white rounded-[2rem] font-black text-xs tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 active:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
          >
            {currentIndex === data.length - 1 ? 'COMPLETE' : 'NEXT'}
            <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}