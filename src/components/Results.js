import React from 'react';
import { RotateCcw, Menu as MenuIcon, CheckCircle, XCircle } from 'lucide-react';

export default function Results({ score, total, quizAnswers, onRetry, onMenu }) {
  const percentage = Math.round((score / total) * 100);
  const mistakes = quizAnswers.filter(a => !a.isCorrect);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-10">
          <div className="inline-block p-6 rounded-full bg-indigo-50 mb-6">
             <div className="text-6xl font-black text-indigo-600">{percentage}%</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Quiz Completed!</h1>
          <p className="text-gray-500 mt-2">You got {score} out of {total} questions correct.</p>
        </div>

        {/* 错题汇总 */}
        {mistakes.length > 0 && (
          <div className="mb-10 text-left">
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <XCircle className="text-red-500" size={20}/> Review Mistakes
            </h3>
            <div className="space-y-3">
              {mistakes.map((m, idx) => (
                <div key={idx} className="p-4 bg-red-50 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-xl font-bold text-gray-800">{m.word.char}</span>
                    <span className="ml-2 text-sm text-gray-500">{m.word.pinyin}</span>
                    <div className="text-sm text-green-600 font-medium">Correct: {m.word.meaning}</div>
                  </div>
                  <div className="text-right text-xs text-red-400 font-bold italic">
                    Your pick: {m.selected.meaning}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button 
            onClick={onRetry}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg"
          >
            <RotateCcw size={20}/> Try Again
          </button>
          <button 
            onClick={onMenu}
            className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200"
          >
            <MenuIcon size={20}/> Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}