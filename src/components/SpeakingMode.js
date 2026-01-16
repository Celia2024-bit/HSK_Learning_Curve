import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Home, Mic, Square, Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
// 假设你已经安装了 pinyin-pro，或者 transcribe.js 内部已处理导入
import { processAndCompare } from '../utils/transcribe'; 

export default function SpeakingMode({ 
  word, 
  currentIndex, 
  total, 
  onSpeak, 
  onExit, 
  onNext, 
  onPrev 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // 新增：正在分析状态
  const [audioUrl, setAudioUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null); // 新增：存储 transcribe.js 返回的结果

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  // 切换题目时清空所有状态
  useEffect(() => {
    setAudioUrl(null);
    setAnalysisResult(null);
    setIsRecording(false);
    setIsProcessing(false);
  }, [word?.char]);

  // 组件卸载时释放资源
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
      setIsProcessing(true); // 停止录音后立即进入“分析中”状态
    } else {
      try {
        if (!streamRef.current || !streamRef.current.active) {
          streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        chunksRef.current = [];
        recorderRef.current = new MediaRecorder(streamRef.current);
        
        recorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        
        recorderRef.current.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);

          // --- 核心集成点：调用 transcribe.js 的函数 ---
          try {
            const audioFile = new File([blob], "recording.webm", { type: 'audio/webm' });
            // 传入文件和当前汉字
            const result = await processAndCompare(audioFile, word.char);
            setAnalysisResult(result);
          } catch (err) {
            console.error("Analysis failed:", err);
          } finally {
            setIsProcessing(false);
          }
        };
        
        recorderRef.current.start();
        setIsRecording(true);
        setAnalysisResult(null);
      } catch (err) {
        alert('Please allow microphone access.');
      }
    }
  };

  const playRecording = () => {
    if (audioUrl) new Audio(audioUrl).play();
  };

  // 渲染诊断面板：显示声母/韵母/声调匹配情况
  const renderAnalysis = () => {
    if (!analysisResult) return null;
    
    return (
      <div className="mt-6 w-full max-w-xs mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="flex justify-around items-center">
          {analysisResult.map((res, i) => (
            <div key={i} className="text-center">
              <div className={`text-3xl font-black mb-1 ${res.isCorrect ? 'text-green-600' : 'text-orange-500'}`}>
                {res.char}
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-2">
                {res.actual || '--'}
              </div>
              {/* 三个点代表：声母、韵母、声调 */}
              <div className="flex gap-1 justify-center">
                <div className={`w-2 h-2 rounded-full ${res.diff.initialMatch ? 'bg-green-400' : 'bg-red-300'}`} title="Initial" />
                <div className={`w-2 h-2 rounded-full ${res.diff.finalMatch ? 'bg-green-400' : 'bg-red-300'}`} title="Final" />
                <div className={`w-2 h-2 rounded-full ${res.diff.toneMatch ? 'bg-green-400' : 'bg-red-300'}`} title="Tone" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!word) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100 max-w-2xl mx-auto">
      {/* 顶部进度 */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-2xl transition-colors">
          <Home size={18} className="text-gray-400" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Exit</span>
        </button>
        <div className="text-2xl font-black text-indigo-600">{currentIndex + 1} / {total}</div>
      </div>

      {/* 汉字卡片 */}
      <div className="text-center mb-6">
        <div className="inline-block p-10 rounded-[3.5rem] bg-indigo-50 mb-4 relative">
          <div className="text-8xl font-black text-indigo-900">{word.char}</div>
          <button 
            onClick={() => onSpeak(word.char, false)}
            className="absolute -right-4 -bottom-4 p-4 bg-white shadow-xl rounded-2xl text-indigo-600 hover:scale-110 transition-transform border border-indigo-100"
          >
            <Volume2 size={32} fill="currentColor" />
          </button>
        </div>
        <div className="text-2xl text-gray-400 font-medium italic mb-2">{word.pinyin}</div>
        <div className="text-lg text-slate-300">{word.meaning}</div>
      </div>

      {/* 分析结果 */}
      <div className="min-h-[120px] flex items-center justify-center">
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyzing Voice...</span>
          </div>
        ) : (
          renderAnalysis()
        )}
      </div>

      {/* 控制按钮 */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={toggleRecording}
            disabled={isProcessing}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isRecording 
                ? 'bg-red-500 animate-pulse scale-110' 
                : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50'
            }`}
          >
            {isRecording ? <Square size={36} className="text-white" fill="white" /> : <Mic size={36} className="text-white" />}
          </button>

          {audioUrl && !isRecording && (
            <button
              onClick={playRecording}
              className="w-16 h-16 rounded-2xl bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all shadow-lg active:scale-95"
            >
              <Play size={28} fill="currentColor" />
            </button>
          )}
        </div>
      </div>

      {/* 导航 */}
      <div className="flex gap-4">
        <button onClick={onPrev} disabled={currentIndex === 0} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold disabled:opacity-50">
          PREV
        </button>
        <button 
          onClick={() => onNext(true, null, true)} 
          className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-indigo-600 transition-all"
        >
          {currentIndex === total - 1 ? 'FINISH' : 'NEXT'}
        </button>
      </div>
    </div>
  );
}