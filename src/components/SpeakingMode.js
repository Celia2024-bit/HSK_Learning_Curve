import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Home, Mic, Square, Play } from 'lucide-react';

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
  const [audioUrl, setAudioUrl] = useState(null);
  
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  // 换题时清空录音
  useEffect(() => {
    setAudioUrl(null);
    setIsRecording(false);
  }, [word?.char]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const toggleRecording = async () => {
    if (isRecording) {
      // 停止录音
      recorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // 开始录音
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunksRef.current = [];
        
        recorderRef.current = new MediaRecorder(stream);
        
        recorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        
        recorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          if (audioUrl) URL.revokeObjectURL(audioUrl);
          setAudioUrl(URL.createObjectURL(blob));
          stream.getTracks().forEach(track => track.stop());
        };
        
        recorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        alert('无法访问麦克风，请允许权限');
      }
    }
  };

  const playRecording = () => {
    if (audioUrl) new Audio(audioUrl).play();
  };

  if (!word) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-2xl transition-colors">
          <Home size={18} className="text-gray-400" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Exit</span>
        </button>
        <div className="text-2xl font-black text-indigo-600">{currentIndex + 1} / {total}</div>
      </div>

      {/* Word Card */}
      <div className="text-center mb-10">
        <div className="inline-block p-12 rounded-[4rem] bg-indigo-50 mb-6 relative">
          <div className="text-9xl font-black text-indigo-900 mb-2">{word.char}</div>
          <button 
            onClick={() => onSpeak(word.char, false)}
            className="absolute -right-4 -bottom-4 p-4 bg-white shadow-xl rounded-2xl text-indigo-600 hover:scale-110 transition-transform border border-indigo-100"
          >
            <Volume2 size={32} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center mb-12">
        <div className="flex items-center justify-center gap-8 min-h-[96px]">
          <button
            onClick={toggleRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isRecording 
                ? 'bg-red-500 animate-pulse scale-110' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isRecording ? (
              <Square size={36} className="text-white" fill="white" />
            ) : (
              <Mic size={36} className="text-white" />
            )}
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
        
        <p className="mt-8 font-black text-gray-400 uppercase tracking-widest text-xs">
          {isRecording ? "Recording..." : audioUrl ? "Click Play or Record Again" : "Click Mic to Record"}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button 
          onClick={onPrev} 
          disabled={currentIndex === 0} 
          className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold disabled:opacity-50"
        >
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