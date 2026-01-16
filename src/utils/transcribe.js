import { pinyin } from 'pinyin-pro';
import { PINYIN_API_URL } from './constants';

const PinyinParser = {
    initials: ['ch', 'sh', 'zh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 's', 'z', 'y', 'w'],
    parse(input) {
        let str = String(input || "").toLowerCase().trim();
        if (!str) return { initial: '', final: '', tone: '' };
        let tone = "";
        const toneMatch = str.match(/\d$/); 
        if (toneMatch) {
            tone = toneMatch[0];
            str = str.replace(/\d$/, ''); 
        }
        let initial = '';
        for (let i of this.initials) {
            if (str.startsWith(i)) {
                initial = i;
                break;
            }
        }
        let final = str.slice(initial.length);
        return { initial, final, tone };
    }
};

// 确保这里有 export
export async function processAndCompare(audioFile, targetText) {
    try {
        // 使用正确的变量名 pinyin
        const expectedPinyins = pinyin(targetText, { 
            toneType: 'num', 
            type: 'array' 
        });

        const formData = new FormData();
        formData.append('file', audioFile);

        const response = await fetch(PINYIN_API_URL, { method: "POST", body: formData });
        const data = await response.json();
        const actualPinyins = data.pinyin || data.tokens || []; 

        return targetText.split('').map((char, index) => {
            const exp = expectedPinyins[index] || "";
            const act = actualPinyins[index] || "";
            const res1 = PinyinParser.parse(exp);
            const res2 = PinyinParser.parse(act);

            return {
                char,
                expected: exp,
                actual: act || "--",
                isCorrect: exp === act,
                diff: {
                    initialMatch: res1.initial === res2.initial,
                    finalMatch: res1.final === res2.final,
                    toneMatch: res1.tone === res2.tone
                }
            };
        });
    } catch (error) {
        console.error("Processing failed:", error);
        throw error;
    }
}