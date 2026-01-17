
import React from 'react';
import { BookOpen, Brain, ChevronRight, Check, Mic } from 'lucide-react';

export default function Menu({
  level,
  setLevel,
  quizCount,
  setQuizCount,
  quizRemoveCorrect,
  setQuizRemoveCorrect,
  speakingLang, 
  setSpeakingLang,
  startMode,

  // 新增：仅在 level === 0 时显示卡片管理按钮（由 App 传入）
  showCardManager = false,
  onOpenCardManager
}) {

  // 定义每个级别的名称和对应的标准单词量
  const levelDetails = {
    0: { name: "Custom", count: null }, // ✅ 新增：Level 0（自定义词库）
    1: { name: "HSK 1", count: 150 },
    2: { name: "HSK 2", count: 150 },
    3: { name: "HSK 3", count: 300 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-gray-100 to-indigo-50 flex flex-col items-center justify-center p-8 text-gray-900">
      
      <div className="w-full max-w-md"> {/* 调窄一点，配合 Header 的宽度 */}
        
        {/* Title Section */}
        <div className="mb-10 ml-2">
          <h1 className="text-4xl font-black tracking-tighter italic text-slate-800">
            HSK<span className="text-indigo-600">.</span>STUDY
          </h1>
          <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-[0.2em] uppercase opacity-70">Smart Spaced Repetition</p>
        </div>

        {/* Level Switcher - 增加了单词总量显示 */}
        <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-[2.5rem] flex mb-10 shadow-sm border border-white">
          {[0, 1, 2, 3].map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`flex-1 py-3 px-2 rounded-[2rem] transition-all duration-300 flex flex-col items-center ${
                level === l 
                ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' 
                : 'text-slate-400 hover:bg-white/40'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {l === 0 ? 'Level 0' : `Level ${l}`}
              </span>
              <span className={`text-[9px] font-bold mt-0.5 opacity-60 ${level === l ? 'text-indigo-100' : 'text-slate-400'}`}>
                {/* Level 0 不显示固定词数，避免误导 */}
                {l === 0 ? 'MY CARDS' : `${levelDetails[l].count} WORDS`}
              </span>
            </button>
          ))}
        </div>

        {/* Settings Card */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Select Length
            </span>
            <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
              {quizCount === 'ALL' ? 'Full Set' : `${quizCount} Cards`}
            </span>
          </div>

          {/* 下拉菜单容器 */}
          <div className="relative group">
            <select
              value={quizCount}
              onChange={(e) => {
                const val = e.target.value;
                // 如果是数字则转为 Number，否则保持字符串 'ALL'
                setQuizCount(val === 'ALL' ? 'ALL' : parseInt(val));
              }}
              className="w-full py-4 px-5 bg-white border-2 border-slate-100 rounded-[2rem] font-black text-slate-600 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all hover:border-indigo-200"
            >
              {[2,5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((num) => (
                <option key={num} value={num}>
                  {num} Questions
                </option>
              ))}
              <option value="ALL">ALL (Full Level)</option>
            </select>
            
            {/* 自定义下拉箭头图标 */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>

          {/* 新增：答对即移除开关 - 完全匹配原有样式风格 */}
          <div className="mt-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Remove Correct Words</p>
              <p className="text-xs font-medium text-slate-500 mt-1 italic">Hide words answered correctly</p>
            </div>
            {/* 开关按钮 - 适配原有设计风格 */}
            <button
              onClick={() => setQuizRemoveCorrect(!quizRemoveCorrect)}
              className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 ${
                quizRemoveCorrect 
                  ? 'bg-indigo-600 shadow-md shadow-indigo-200' 
                  : 'bg-slate-200'
              }`}
            >
              <div 
                className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform duration-300 ${
                  quizRemoveCorrect ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {/* 选中时显示对勾 - 增强视觉反馈 */}
                {quizRemoveCorrect && (
                  <Check size={10} className="mx-auto text-indigo-600 font-bold" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Action Modes */}
        <div className="space-y-3">
          <button 
            onClick={() => startMode('flashcard')}
            className="w-full group bg-white p-6 rounded-[2rem] shadow-sm border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-base font-black text-slate-800 tracking-tight">Flashcards</h3>
                <p className="text-xs font-medium text-slate-400 italic leading-none mt-1">Review &amp; Mastery</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
          </button>

          {/* ✅ level = 0 时隐藏 Reading */}
          {level !== 0 && (
            <button 
              onClick={() => startMode('reading')}
              className="w-full group bg-white p-6 rounded-[2rem] shadow-sm border border-transparent hover:border-indigo-200 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Reading</h3>
                  <p className="text-xs font-medium text-slate-400 italic leading-none mt-1">Context Practice</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg">Start</span>
                <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
              </div>
            </button>
          )}
          
          {/* 1. 这里是新增的语言选择器 UI */}
          <div className="flex justify-between items-center px-4 pt-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Speaking Target</span>
            <div className="flex bg-gray-200/50 p-1 rounded-xl">
              {['zh', 'en', 'fr'].map((l) => (
                <button
                  key={l}
                  onClick={() => setSpeakingLang(l)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    speakingLang === l ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {l === 'zh' ? 'CN' : l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => startMode('speaking')}
            className="w-full group bg-white p-6 rounded-[2rem] shadow-sm border border-transparent hover:border-green-100 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-base font-black text-slate-800 tracking-tight">Speaking Quiz</h3>
                <p className="text-xs font-medium text-slate-400 italic leading-none mt-1">Pronunciation Coach</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg">Start</span>
              <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
            </div>
          </button>
          
        <button 
          onClick={() => startMode('quiz')}
          className="w-full group bg-white p-6 rounded-[2rem] shadow-sm border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between mt-4"
        >
          <div className="flex items-center gap-5">
            {/* 使用紫色背景的图标容器 */}
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-base font-black text-slate-800 tracking-tight">Adaptive Quiz</h3>
              <p className="text-xs font-medium text-slate-400 italic leading-none mt-1">Test your knowledge</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg">Start</span>
            <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
          </div>
        </button>

          {/* ✅ 仅在 level = 0 时显示卡片管理按钮（沿用你的布局风格） */}
          {showCardManager && (
            <button
              onClick={onOpenCardManager}
              className="w-full group bg-white p-6 rounded-[2rem] shadow-sm border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {/* 复用 Brain 图标或可换成自定义图标 */}
                  <Brain size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Card Manager</h3>
                  <p className="text-xs font-medium text-slate-400 italic leading-none mt-1">Add / Edit / Delete</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
