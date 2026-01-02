import React from 'react';
import { Home, RotateCcw, Volume2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Results({ score, total, quizAnswers, onRetry, onMenu, onSpeak }) {
  const percentage = Math.round((score / total) * 100);
  
  // 过滤出错误的题目
  const mistakes = quizAnswers.filter(ans => !ans.isCorrect);
  // 过滤出正确的题目
  const corrects = quizAnswers.filter(ans => ans.isCorrect);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-gray-100 to-indigo-50 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-md">
        
        {/* Score Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-indigo-100/50 mb-8 text-center border border-white">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-50 mb-4">
            <span className="text-3xl font-black text-indigo-600">{percentage}%</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800">Session Complete</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            {score} Correct • {total - score} Mistake{total - score !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Smart Analysis - 告诉用户数据变化 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/60 p-5 rounded-3xl border border-white flex flex-col items-center">
            <CheckCircle2 className="text-green-500 mb-2" size={20} />
            <span className="text-xl font-black text-slate-700">{corrects.length}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center leading-none">Strengthened in Memory</span>
          </div>
          <div className="bg-white/60 p-5 rounded-3xl border border-white flex flex-col items-center">
            <AlertCircle className="text-orange-500 mb-2" size={20} />
            <span className="text-xl font-black text-slate-700">{mistakes.length}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center leading-none">Priority for Next Quiz</span>
          </div>
        </div>

        {/* Mistake Review - 最实用的部分 */}
        {mistakes.length > 0 && (
          <div className="mb-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Quick Review (Mistakes)</p>
            <div className="space-y-3">
              {mistakes.map((m, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-red-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-slate-800">{m.word.char}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-400">{m.word.pinyin}</p>
                      <p className="text-sm font-black text-red-500 uppercase leading-none">{m.word.meaning}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onSpeak(m.word.char)}
                    className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={onMenu}
            className="flex-1 py-5 bg-white text-slate-600 rounded-[2rem] font-black text-sm shadow-sm hover:bg-slate-50 transition-all border border-slate-100 flex items-center justify-center gap-2"
          >
            <Home size={18} /> HOME
          </button>
          <button 
            onClick={onRetry}
            className="flex-[2] py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> RE-QUIZ NOW
          </button>
        </div>

      </div>
    </div>
  );
}