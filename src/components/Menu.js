import React from 'react';
import { BookOpen, Brain, ChevronRight } from 'lucide-react';

export default function Menu({ level, setLevel, startMode, quizCount, setQuizCount }) {
  // 定义每个级别的名称和对应的标准单词量
  const levelDetails = {
    1: { name: "HSK 1", count: 150 },
    2: { name: "HSK 2", count: 300 },
    3: { name: "HSK 3", count: 600 }
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
          {[1, 2, 3].map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`flex-1 py-3 px-2 rounded-[2rem] transition-all duration-300 flex flex-col items-center ${
                level === l 
                ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' 
                : 'text-slate-400 hover:bg-white/40'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter">Level {l}</span>
              <span className={`text-[9px] font-bold mt-0.5 opacity-60 ${level === l ? 'text-indigo-100' : 'text-slate-400'}`}>
                {levelDetails[l].count} WORDS
              </span>
            </button>
          ))}
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-100/50 mb-8 border border-white">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Session Questions</p>
              <h2 className="text-3xl font-black text-slate-800 mt-1">
                {quizCount} <span className="text-sm text-slate-400 uppercase tracking-tighter">Words</span>
              </h2>
            </div>
          </div>
          
          <input 
            type="range" min="5" max="50" step="5" 
            value={quizCount} 
            onChange={(e) => setQuizCount(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
          />
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
                <p className="text-xs font-medium text-slate-400 italic leading-none mt-1">Review & Mastery</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
          </button>

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
            <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
          </button>

          <button 
            onClick={() => startMode('quiz')}
            className="w-full mt-4 py-5 bg-slate-900 text-white rounded-[2.2rem] font-black text-lg shadow-xl shadow-indigo-200/50 hover:bg-indigo-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            START ADAPTIVE QUIZ
          </button>
        </div>

      </div>
    </div>
  );
}