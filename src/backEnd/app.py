import asyncio
import io
import json
import os
import edge_tts
from flask import Flask, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

PROGRESS_FILE = 'progress.json'
MASTERY_FILE = 'mastery.json'

async def get_tts_data(text, voice):
    communicate = edge_tts.Communicate(text, voice)
    audio_stream = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_stream.write(chunk["data"])
    audio_stream.seek(0)
    return audio_stream

@app.route('/tts')
def tts():
    text = request.args.get('text')
    voice = request.args.get('voice', 'zh-CN-YunjianNeural')
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        audio_data = loop.run_until_complete(get_tts_data(text, voice))
        loop.close()
        return send_file(audio_data, mimetype="audio/mpeg")
    except Exception as e:
        return str(e), 500

@app.route('/save_progress', methods=['POST'])
def save_progress():
    data = request.json
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return {"status": "success"}

@app.route('/get_progress', methods=['GET'])
def get_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"level": 1, "mode": "menu", "index": 0}

@app.route('/save_mastery', methods=['POST'])
def save_mastery():
    data = request.json
    char = data.get('char')
    record = data.get('record')
    mastery_data = {}
    if os.path.exists(MASTERY_FILE):
        with open(MASTERY_FILE, 'r', encoding='utf-8') as f:
            try: mastery_data = json.load(f)
            except: pass
    mastery_data[char] = record
    with open(MASTERY_FILE, 'w', encoding='utf-8') as f:
        json.dump(mastery_data, f, ensure_ascii=False, indent=2)
    return {"status": "success"}

@app.route('/get_mastery', methods=['GET'])
def get_mastery():
    if os.path.exists(MASTERY_FILE):
        with open(MASTERY_FILE, 'r', encoding='utf-8') as f:
            try: return json.load(f)
            except: return {}
    return {}

if __name__ == '__main__':
    app.run(debug=True, port=5001)