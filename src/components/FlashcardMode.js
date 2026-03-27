// FlashcardMode.js
import React, { useState, useEffect } from 'react';
import { Volume2, Home, ArrowLeft, ArrowRight, List, X, Flag, Settings } from 'lucide-react';

// 三种顺序配置
const REVEAL_ORDERS = {
  char:    ['char', 'pinyin', 'meaning'],  // 汉字 → 拼音 → 英文
  pinyin:  ['pinyin', 'char', 'meaning'],  // 拼音 → 汉字 → 英文
  meaning: ['meaning', 'char', 'pinyin'],  // 英文 → 汉字 → 拼音
};

const ORDER_LABELS = {
  char:    { label: 'Character first', seq: ['Character', 'Pinyin', 'Meaning'] },
  pinyin:  { label: 'Pinyin first',    seq: ['Pinyin', 'Character', 'Meaning'] },
  meaning: { label: 'Meaning first',   seq: ['Meaning', 'Character', 'Pinyin'] },
};

export default function FlashcardMode({ 
  data, currentIndex, setIndex, onBack, onComplete, onSpeak, level, 
  currentMastery, onUpdateMastery,
  flaggedWords, toggleWordFlag,
  revealOrder = 'char',       // ← 新增：从 App.js 传入（从 progress 读取）
  onSaveRevealOrder,          // ← 新增：保存回调
}) {
  const [step, setStep] = useState(0);
  const [showWordList, setShowWordList] = useState(false);
  const [showOrderSettings, setShowOrderSettings] = useState(false); // ← 新增
  const current = data[currentIndex];

  const order = REVEAL_ORDERS[revealOrder] || REVEAL_ORDERS.char;

  const handleFlag = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWordFlag(current.char, !isFlagged);
  };

  useEffect(() => {
    setStep(0);
  }, [currentIndex]);

  const handleCardClick = () => {
    setStep((prev) => (prev + 1) % 4);
  };

  const handleNext = () => {
    if (currentIndex < data.length - 1) setIndex(currentIndex + 1);
    else onComplete();
  };

  const handlePrev = () => {
    if (currentIndex > 0) setIndex(currentIndex - 1);
  };

  const jumpToWord = (index) => {
    setIndex(index);
    setShowWordList(false);
  };

  // 根据 order 和 step 决定显示什么
  const renderStep = () => {
    if (step === 3) {
      // 第 4 步：总结，永远三合一
      return (
        <div className="flex flex-col items-center animate-in fade-in zoom-in-90 duration-500">
          <h2 className="text-5xl font-black bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 tracking-tighter">
            {current.char}
          </h2>
          <p className="text-2xl font-bold text-emerald-500 mb-2 font-sans">
            {current.pinyin}
          </p>
          <p className="text-2xl font-black bg-gradient-to-br from-orange-400 to-rose-500 bg-clip-text text-transparent px-2 leading-tight">
            {current.meaning}
          </p>
        </div>
      );
    }

    const field = order[step]; // 'char' | 'pinyin' | 'meaning'

    if (field === 'char') return (
      <h2 className="text-5xl font-black bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-in fade-in zoom-in-95 duration-500 uppercase">
        {current.char}
      </h2>
    );
    if (field === 'pinyin') return (
      <p className="text-2xl font-bold text-emerald-500 animate-in slide-in-from-bottom-8 duration-500 font-sans tracking-tight">
        {current.pinyin}
      </p>
    );
    if (field === 'meaning') return (
      <p className="text-2xl font-black bg-gradient-to-br from-orange-400 to-rose-500 bg-clip-text text-transparent animate-in fade-in duration-500 px-2 leading-tight">
        {current.meaning}
      </p>
    );
  };

  if (!current) return null;
  const isFlagged = flaggedWords[String(level)]?.includes(current.char);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-800 p-4 pt-16 flex flex-col items-center font-sans relative">

      {/* ── 单词列表弹窗（不变）── */}
      {showWordList && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">HSK Level {level} 单词列表</h3>
              <button onClick={() => setShowWordList(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {data.map((word, index) => (
                  <button key={index} onClick={() => jumpToWord(index)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      currentIndex === index ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}>
                    <div className="font-black text-lg">{word.char}</div>
                    <div className="text-xs text-slate-400 mt-1">{word.pinyin}</div>
                    <div className="text-xs text-slate-500 italic mt-0.5 truncate">{word.meaning}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-center">
              <span className="text-xs text-slate-400 font-bold">共 {data.length} 个单词 | 当前第 {currentIndex + 1} 个</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 新增：顺序设置底部弹窗 ── */}
      {showOrderSettings && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={() => setShowOrderSettings(false)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-8"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black text-slate-800">First reveal</h3>
              <button onClick={() => setShowOrderSettings(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <X size={16} />
              </button>
            </div>

            {Object.entries(ORDER_LABELS).map(([key, { label, seq }]) => (
              <button key={key}
                onClick={() => { onSaveRevealOrder?.(key); setShowOrderSettings(false); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl mb-2 text-left transition-all ${
                  revealOrder === key
                    ? 'bg-indigo-50 border-2 border-indigo-400'
                    : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'
                }`}>
                <div>
                  <div className={`font-black text-sm ${revealOrder === key ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {label}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {seq.map((s, i) => (
                      <React.Fragment key={s}>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          i === 0
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-200 text-slate-500'
                        }`}>{s}</span>
                        {i < seq.length - 1 && <span className="text-slate-300 text-xs">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                {revealOrder === key && (
                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black">✓</div>
                )}
              </button>
            ))}

            <p className="text-[10px] text-slate-400 text-center mt-3 font-bold tracking-wide">
                Step 4 always shows the full summary
            </p>
          </div>
        </div>
      )}

      <div className="max-w-md w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-end items-center mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">HSK Level {level}</div>
              <div className="text-sm font-black text-slate-600">
                {currentIndex + 1} <span className="text-slate-200 mx-0.5">/</span> {data.length}
              </div>
            </div>

            {/* ← 新增：设置按钮 */}
            <button
              onClick={() => setShowOrderSettings(true)}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all border border-white"
            >
              <Settings size={18} />
            </button>

            {/* 单词列表按钮 */}
            <button
              onClick={() => setShowWordList(true)}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all border border-white"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* 核心卡片 wrapper */}
        <div className="relative">
          <button onClick={onBack}
            className="absolute top-5 left-5 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            <Home size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Menu</span>
          </button>

          <div onClick={handleCardClick}
            className="relative bg-white rounded-[3.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.04)] border border-white p-7 min-h-[360px] flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-[0.98] overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
              {renderStep()}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onSpeak(current.char, true); }}
              className="mt-5 relative group">
              <div className="relative w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90">
                <Volume2 size={28} />
              </div>
            </button>
          </div>
        </div>

        {/* 底部掌握度 + flag */}
        <div className="flex items-center justify-between gap-4 px-2">
          <div className="flex flex-1 justify-between bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            {[1, 2, 3, 4, 5].map((score) => (
              <button key={score}
                onClick={(e) => { e.stopPropagation(); onUpdateMastery(current.char, { score }); }}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-colors ${
                  (currentMastery?.score || 1) === score ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'
                }`}>
                {score}
              </button>
            ))}
          </div>
          <button onClick={handleFlag}
            className={`p-4 rounded-2xl transition-all ${isFlagged ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
            <Flag fill={isFlagged ? "currentColor" : "none"} size={22} />
          </button>
        </div>

        {/* 底部导航 */}
        <div className="mt-6 flex gap-4 px-2">
          <button onClick={handlePrev} disabled={currentIndex === 0}
            className="flex-1 h-16 bg-slate-200 text-slate-700 rounded-[2rem] font-black text-xs tracking-widest disabled:opacity-30 disabled:bg-slate-100 disabled:text-slate-300 hover:bg-slate-300 transition-all shadow-sm flex items-center justify-center gap-2">
            <ArrowLeft size={18} strokeWidth={3} />
            PREV
          </button>
          <button onClick={handleNext}
            className="flex-1 h-16 bg-slate-900 text-white rounded-[2rem] font-black text-xs tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 active:bg-indigo-700 transition-all flex items-center justify-center gap-2 group">
            {currentIndex === data.length - 1 ? 'COMPLETE' : 'NEXT'}
            <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}