import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Home, Mic, Square, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { processAndCompare } from '../utils/transcribe';
import { processTranslationSpeech } from '../utils/fetchUtils'; 

export default function SpeakingMode({ word, currentIndex, total, lang, onSpeak, onExit, onNext, onPrev }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [results, setResults] = useState(null);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  // 换题重置
  useEffect(() => {
    setAudioUrl(null);
    setResults(null);
    setIsRecording(false);
    setIsProcessing(false);
  }, [word?.char]);

  const toggleRecording = async () => {
    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
      setIsProcessing(true);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunksRef.current = [];
        recorderRef.current = new MediaRecorder(stream);
        recorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
        
        recorderRef.current.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const file = new File([blob], "rec.webm", { type: 'audio/webm' });
          setAudioUrl(URL.createObjectURL(blob));
          
          try {
            let analysis;
            if (lang === 'zh') {
              analysis = await processAndCompare(file, word.char);
            } else {
              const targetLang = lang === 'en' ? 'en-US' : 'fr-FR';
              const res = await processTranslationSpeech(file, word.meaning, targetLang);
              analysis = [{ char: word.char, expected: res.expected, actual: res.actual, isCorrect: res.isCorrect }];
            }
            setResults(analysis);
          } catch (err) {
            console.error(err);
          } finally {
            setIsProcessing(false);
            stream.getTracks().forEach(t => t.stop());
          }
        };
        recorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        alert('Microphone access denied');
      }
    }
  };

  // --- 模拟 index.html 渲染结果的函数 ---
  const renderResults = () => {
    if (!results || results.length === 0) return null;

    // 1. 中文拼音模式：保留你原本精细的诊断 UI
    if (lang === 'zh') {
      return (
        <div className="flex flex-wrap justify-center gap-3 mt-8 animate-in fade-in zoom-in duration-300">
          {results.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col items-center p-4 rounded-2xl border-2 min-w-[110px] shadow-sm ${
                item.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-100 bg-red-50'
              }`}
            >
              <span className="text-4xl font-black text-slate-800 mb-1">{item.char}</span>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Target: <span className="lowercase">{item.expected}</span>
              </div>
              <div className={`text-sm font-black mt-1 ${item.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                You: <span className="lowercase">{item.actual === "--" ? "--" : item.actual}</span>
              </div>

              <div className="flex flex-col gap-1 mt-3 w-full">
                {item.isCorrect ? (
                  <div className="flex items-center justify-center gap-1 text-[10px] font-black text-green-600 bg-green-100 py-1 rounded-lg">
                    <CheckCircle2 size={10} /> PERFECT!
                  </div>
                ) : item.actual === "--" ? (
                  <div className="text-[10px] font-black text-slate-400 bg-slate-200 py-1 rounded-lg text-center">
                    NO AUDIO
                  </div>
                ) : (
                  <>
                    {/* 这里保留你原本的 diff 诊断 */}
                    {!item.diff?.initialMatch && (
                      <span className="text-[9px] font-black text-white bg-[#ff4d4f] py-1 px-2 rounded-md uppercase text-center">Initial Error</span>
                    )}
                    {!item.diff?.finalMatch && (
                      <span className="text-[9px] font-black text-white bg-[#faad14] py-1 px-2 rounded-md uppercase text-center">Final Error</span>
                    )}
                    {!item.diff?.toneMatch && (
                      <span className="text-[9px] font-black text-white bg-[#1890ff] py-1 px-2 rounded-md uppercase text-center">Tone Error</span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 2. 翻译模式 (EN/FR)：简洁风格，因为翻译没有声母韵母之分
    const item = results[0]; // 翻译模式通常只有一个结果
    return (
      <div className="flex flex-col items-center mt-8 animate-in zoom-in duration-300">
        <div className={`p-6 rounded-[2.5rem] border-2 shadow-sm flex flex-col items-center ${
          item.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-100 bg-red-50'
        }`}>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recognized {lang}</div>
          <div className={`text-3xl font-black mb-3 ${item.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
            {item.actual || '--'}
          </div>
          
          {item.isCorrect ? (
            <div className="px-4 py-1.5 bg-green-500 text-white rounded-xl text-[10px] font-black flex items-center gap-2">
              <CheckCircle2 size={12} /> MEANING MATCHED
            </div>
          ) : (
            <div className="text-center">
              <div className="text-[10px] font-bold text-red-400 uppercase mb-1">Expected one of:</div>
              <div className="text-sm font-black text-slate-700 italic">{item.expected}</div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const isPerfectMatch = results && results.length > 0 && results.every(item => item.isCorrect);
  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl p-6 sm:p-10 border border-gray-100 max-w-2xl mx-auto">
    <div className="flex justify-between items-center mb-10"> {/* 增加一点底部边距 */}
          
          {/* 1. 左侧：Exit 按钮 */}
          <div className="flex-1 flex justify-start">
            <button onClick={onExit} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-2xl transition-colors">
              <Home size={18} className="text-gray-400" />
              <span className="hidden sm:inline text-xs font-black uppercase tracking-widest text-gray-400">Back</span>
            </button>
          </div>

          {/* 2. 中间：语言标签 (放入此处绝不会重叠) */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-xl border border-indigo-100/50">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-400'}`}></div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest whitespace-nowrap">
              {
                {
                  'zh': 'Chinese',
                  'en': 'English',
                  'fr': 'French'
                }[lang] || lang.toUpperCase()
              }
            </span>
          </div>

          {/* 3. 右侧：进度计数 */}
          <div className="flex-1 flex justify-end">
            <div className="text-2xl font-black text-indigo-600 tracking-tighter">
              {currentIndex + 1} <span className="text-indigo-200 text-lg">/</span> {total}
            </div>
          </div>
        </div>
    {/* --- Header 结束 --- */}

      {/* Main Word Area */}
      <div className="text-center">
        <div className="inline-block p-10 rounded-[3.5rem] bg-indigo-50 mb-4 relative">
          <div className="text-8xl font-black text-indigo-900 leading-none">{word.char}</div>
          <button 
            onClick={() => onSpeak(word.char, false)}
            className="absolute -right-4 -bottom-4 p-4 bg-white shadow-xl rounded-2xl text-indigo-600 border border-indigo-50 hover:scale-110 transition-transform"
          >
            <Volume2 size={28} fill="currentColor" />
          </button>
        </div>
        
        {/* 结果/加载展示区 */}
        <div className="min-h-[160px] flex items-center justify-center">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Analyzing Pronunciation...</p>
            </div>
          ) : (
            renderResults()
          )}
        </div>
      </div>

      {/* Mic Controls */}
      <div className="flex flex-col items-center justify-center my-10">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={toggleRecording}
            disabled={isProcessing}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
              isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-indigo-600 hover:bg-indigo-700'
            } disabled:opacity-20`}
          >
            {isRecording ? <Square size={36} className="text-white" fill="white" /> : <Mic size={36} className="text-white" />}
          </button>

          {audioUrl && !isRecording && (
            <button
              onClick={() => new Audio(audioUrl).play()}
              className="w-16 h-16 rounded-2xl bg-green-500 text-white flex items-center justify-center hover:bg-green-600 shadow-lg"
            >
              <Play size={28} fill="currentColor" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex gap-4">
        <button onClick={onPrev} disabled={currentIndex === 0} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold">PREV</button>
        <button 
          onClick={() => onNext(!!isPerfectMatch, null, true)}
          className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-indigo-600">
          {currentIndex === total - 1 ? 'FINISH' : 'NEXT'}
        </button>
      </div>
    </div>
  );
}