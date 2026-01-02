import asyncio
import io
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

if __name__ == '__main__':
    # 建议尝试 5001 端口
    app.run(debug=True, port=5001)