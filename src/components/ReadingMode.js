import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2, ArrowLeft } from 'lucide-react';

export default function ReadingMode({ data, onBack, onSpeak }) {
  const [index, setIndex] = useState(0);

  // 防错处理：如果没拿到数据，显示加载中或返回
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <p className="text-slate-400 mb-4">No sentences found for this level.</p>
        <button onClick={onBack} className="text-indigo-600 font-bold">Return to Menu</button>
      </div>
    );
  }

  const current = data[index];

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* 顶部导航 */}
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={20} /> <span className="text-xs font-black uppercase tracking-widest">Back to Menu</span>
      </button>

      {/* 句子卡片 */}
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-indigo-100/50 border border-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
            <button 
              onClick={() => onSpeak(current.chinese, false)}
              className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
            >
              <Volume2 size={24} />
            </button>
        </div>

        <div className="space-y-6 pt-8">
          <h2 className="text-4xl font-black text-slate-800 leading-tight">
            {current.chinese}
          </h2>
          <div className="space-y-1">
            <p className="text-lg font-bold text-indigo-500/80 tracking-wide italic">
              {current.pinyin}
            </p>
            <p className="text-xl font-medium text-slate-400">
              {current.english}
            </p>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-between px-4">
        <button 
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={index === 0}
          className="w-16 h-16 rounded-3xl bg-white shadow-lg flex items-center justify-center text-slate-300 hover:text-indigo-600 disabled:opacity-20 transition-all"
        >
          <ChevronLeft size={32} />
        </button>
        
        <span className="font-black text-slate-300 tracking-widest uppercase text-sm">
          {index + 1} <span className="mx-2 text-slate-200">/</span> {data.length}
        </span>

        <button 
          onClick={() => setIndex(Math.min(data.length - 1, index + 1))}
          disabled={index === data.length - 1}
          className="w-16 h-16 rounded-3xl bg-slate-900 shadow-lg flex items-center justify-center text-white hover:bg-indigo-600 disabled:opacity-20 transition-all"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
}