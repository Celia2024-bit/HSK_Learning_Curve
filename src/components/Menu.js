import React from 'react';
import { BookOpen, Brain, ChevronRight, Check, Mic,Flag, FlagOff } from 'lucide-react';

export default function Menu({
  level,
  setLevel,
  quizCount,
  setQuizCount,
  quizRemoveCorrect,
  setQuizRemoveCorrect,
  flashcardRandomOrder, 
  setFlashcardRandomOrder,
  flashcardFilter,
  setFlashcardFilter,
  speakingLang, 
  setSpeakingLang,
  startMode,
  showCardManager = false,
  onOpenCardManager
}) {

  // 定义每个级别的名称和对应的标准单词量
  // Old HSK: 1–3 | New HSK: 11–17 | Custom: 0
  const levelDetails = {
    0:  { name: "Custom", count: null },
    1:  { name: "HSK 1",  count: 150  },
    2:  { name: "HSK 2",  count: 150  },
    3:  { name: "HSK 3",  count: 300  },
    11: { name: "HSK 1",  count: 479  },
    12: { name: "HSK 2",  count: 764  },
    13: { name: "HSK 3",  count: 966  },
    14: { name: "HSK 4",  count: 995  },
    15: { name: "HSK 5",  count: 1067 },
    16: { name: "HSK 6",  count: 1134 },
    17: { name: "HSK 7",  count: 5618 },
  };

  // 当前选中的词库组（level=0 是 custom，不属于任何组）
  const currentGroup = level >= 11 ? 'new' : level === 0 ? null : 'old';

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

        {/* Level Switcher — My Cards / Old HSK / New HSK */}
        <div className="mb-10 space-y-3">

          {/* 顶部 Group 切换 */}
          <div className="bg-white/60 backdrop-blur-md p-1 rounded-[2rem] flex shadow-sm border border-white">
            <button
              onClick={() => setLevel(0)}
              className={`flex-1 py-2.5 px-2 rounded-[1.8rem] transition-all duration-300 flex flex-col items-center ${
                level === 0 ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-white/40'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter">My Cards</span>
              <span className={`text-[9px] font-bold mt-0.5 opacity-60 ${level === 0 ? 'text-indigo-100' : 'text-slate-400'}`}>CUSTOM</span>
            </button>
            <button
              onClick={() => setLevel(1)}
              className={`flex-1 py-2.5 px-2 rounded-[1.8rem] transition-all duration-300 flex flex-col items-center ${
                currentGroup === 'old' ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-white/40'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter">Old HSK</span>
              <span className={`text-[9px] font-bold mt-0.5 opacity-60 ${currentGroup === 'old' ? 'text-indigo-100' : 'text-slate-400'}`}>1–3</span>
            </button>
            <button
              onClick={() => setLevel(11)}
              className={`flex-1 py-2.5 px-2 rounded-[1.8rem] transition-all duration-300 flex flex-col items-center ${
                currentGroup === 'new' && level !== 0 ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-white/40'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter">New HSK</span>
              <span className={`text-[9px] font-bold mt-0.5 opacity-60 ${currentGroup === 'new' && level !== 0 ? 'text-indigo-100' : 'text-slate-400'}`}>1–7</span>
            </button>
          </div>

          {/* 二级 level 选择 */}
          {level !== 0 && (
            <div className="bg-white/60 backdrop-blur-md p-1 rounded-[2rem] flex shadow-sm border border-white">
              {currentGroup === 'old'
                ? [1, 2, 3].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`flex-1 py-2.5 px-2 rounded-[1.8rem] transition-all duration-300 flex flex-col items-center ${
                        level === l ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-white/40'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-tighter">HSK {l}</span>
                      <span className={`text-[9px] font-bold mt-0.5 opacity-60 ${level === l ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {levelDetails[l].count} WORDS
                      </span>
                    </button>
                  ))
                : [11, 12, 13, 14, 15, 16, 17].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`flex-1 py-2 px-1 rounded-[1.8rem] transition-all duration-300 flex flex-col items-center ${
                        level === l ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-white/40'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-tighter">{l - 10}</span>
                      <span className={`text-[9px] font-bold mt-0.5 opacity-60 ${level === l ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {levelDetails[l].count}
                      </span>
                    </button>
                  ))
              }
            </div>
          )}
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

          {/* 原有：答对即移除开关 */}
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

          {/* 新增：闪卡随机顺序开关 - 完全匹配原有开关样式 */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Flashcard Random Order</p>
              <p className="text-xs font-medium text-slate-500 mt-1 italic">Randomize flashcard sequence</p>
            </div>
            {/* 开关按钮 - 和"答对即移除"样式完全一致 */}
            <button
              onClick={() => setFlashcardRandomOrder(!flashcardRandomOrder)}
              className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 ${
                flashcardRandomOrder 
                  ? 'bg-indigo-600 shadow-md shadow-indigo-200' 
                  : 'bg-slate-200'
              }`}
            >
              <div 
                className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform duration-300 ${
                  flashcardRandomOrder ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {/* 选中时显示对勾 */}
                {flashcardRandomOrder && (
                  <Check size={10} className="mx-auto text-indigo-600 font-bold" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Action Modes */}
        <div className="space-y-3">

          {/* Flashcard Filter selector */}
          <div className="flex justify-between items-center px-4 pt-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flashcard Filter</span>
            <div className="flex bg-gray-200/50 p-1 rounded-xl">
              {['all', 'flagged', 'unflagged'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFlashcardFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center ${
                    flashcardFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {f === 'all' ? 'ALL' : f === 'flagged' ? <Flag size={12} fill="#ef4444" color="#ef4444" /> : <FlagOff size={12} />}
                </button>
              ))}
            </div>
          </div>

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