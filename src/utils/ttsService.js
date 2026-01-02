/**
 * ttsService.js
 * 封装 Edge-TTS 调用逻辑
 */

export const speakChinese = (text, voice = "zh-CN-YunyangNeural") => {
  // 1. 停止当前正在播放的所有音频（防止多个声音重叠）
  if (window.currentAudio) {
    window.currentAudio.pause();
    window.currentAudio = null;
  }

  // 2. 构造指向后端的 URL (确保你的 Python/Node 后端运行在 5001 端口)
  const backendUrl = `http://localhost:5001/tts?text=${encodeURIComponent(text)}&voice=${voice}`;

  // 3. 创建并播放音频
  const audio = new Audio(backendUrl);
  window.currentAudio = audio;

  return audio.play().catch(err => {
    console.warn("Edge-TTS 播放失败，尝试降级到浏览器原生语音:", err);
    
    // 降级方案：如果后端没开，使用浏览器自带的 Web Speech API
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-CN';
    window.speechSynthesis.speak(msg);
  });
};

