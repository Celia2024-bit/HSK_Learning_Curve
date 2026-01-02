import asyncio
import io
import json
import os
import edge_tts
from flask import Flask, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

async def get_tts_data(text, voice):
    # 使用 Communicate 直接构造
    communicate = edge_tts.Communicate(text, voice)
    audio_stream = io.BytesIO()
    
    # 将流数据写入内存文件
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_stream.write(chunk["data"])
    
    audio_stream.seek(0)
    return audio_stream

@app.route('/tts')
def tts():
    text = request.args.get('text')
    # 修正：确保参数名和你的前端对应
    voice = request.args.get('voice', 'zh-CN-YunjianNeural')

    if not text:
        return "Missing text", 400

    try:
        # 针对 Flask 环境下的 asyncio 处理
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        audio_data = loop.run_until_complete(get_tts_data(text, voice))
        loop.close()
        
        return send_file(
            audio_data,
            mimetype="audio/mpeg",
            as_attachment=False
        )
    except Exception as e:
        print(f"TTS Error: {e}")
        return str(e), 500
        
PROGRESS_FILE = 'progress.json'

@app.route('/save_progress', methods=['POST'])
def save_progress():
    data = request.json
    # data 格式设计: { "level": 1, "mode": "flashcard", "index": 5 }
    try:
        with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

@app.route('/get_progress', methods=['GET'])
def get_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"level": 1, "mode": "menu", "index": 0} # 默认值

if __name__ == '__main__':
    # 建议尝试 5001 端口
    app.run(debug=True, port=5001)