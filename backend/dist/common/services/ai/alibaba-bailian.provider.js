"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlibabaBailianProvider = void 0;
const openai_1 = __importDefault(require("openai"));
class AlibabaBailianProvider {
    constructor(config) {
        this.config = config;
        this.client = new openai_1.default({
            apiKey: this.config.getOrThrow('ALIBABA_BAILIAN_API_KEY'),
            baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        });
    }
    async recognizeClothing(imageBase64) {
        const res = await this.client.chat.completions.create({
            model: 'qwen-vl-max',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
                        },
                        {
                            type: 'text',
                            text: `识别这张图片中的服装单品，返回严格的 JSON（不要 markdown 代码块）：
{"category":"top|bottom|dress|shoes|bag|accessory","color":"black|white|red|blue|green|yellow|pink|gray|brown|beige|multi","style":"casual|formal|sport|sweet|street|minimal","season":"spring|summer|autumn|winter|all","name":"简短名称如白色亚麻衬衫","confidence":0.9}
只返回 JSON，不要其他文字。`,
                        },
                    ],
                },
            ],
            max_tokens: 300,
        });
        const text = res.choices[0]?.message?.content ?? '{}';
        return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    }
    async recommendOutfit(clothes, scene) {
        const clothesList = clothes
            .map((c) => `id:${c.id} ${c.name} (${c.category}/${c.color}/${c.style})`)
            .join('\n');
        const res = await this.client.chat.completions.create({
            model: 'qwen-max',
            messages: [
                {
                    role: 'user',
                    content: `你是一个穿搭顾问。用户衣橱中有以下衣物：
${clothesList}

用户场景：${scene}

请从衣橱中挑选 2-3 套搭配方案。每套需包含上衣、下装、鞋（如果衣橱有的话）。
返回严格的 JSON 数组（不要 markdown 代码块）：
[{"items":[{"clothe_id":1,"role":"top"},{"clothe_id":2,"role":"bottom"},{"clothe_id":3,"role":"shoes"}],"reason":"搭配理由","score":85}]
只返回 JSON 数组，不要其他文字。`,
                },
            ],
            max_tokens: 1000,
        });
        const text = res.choices[0]?.message?.content ?? '[]';
        return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    }
    async evaluateOutfit(clothes) {
        const clothesList = clothes
            .map((c) => `id:${c.id} ${c.name} (${c.category}/${c.color}/${c.style})`)
            .join('\n');
        const res = await this.client.chat.completions.create({
            model: 'qwen-max',
            messages: [
                {
                    role: 'user',
                    content: `你是一个时尚穿搭评审。用户选择了以下衣物进行搭配：
${clothesList}

请从色彩协调度、风格统一性、场合适配度三个维度评价。
返回严格的 JSON（不要 markdown 代码块）：
{"score":85,"pros":["优点1","优点2"],"cons":["缺点1"],"suggestion":"改进建议"}
只返回 JSON，不要其他文字。`,
                },
            ],
            max_tokens: 500,
        });
        const text = res.choices[0]?.message?.content ?? '{}';
        return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    }
    async transcribeAudio(audioBase64) {
        const apiKey = this.config.getOrThrow('ALIBABA_BAILIAN_API_KEY');
        const dataUri = `data:audio/mp3;base64,${audioBase64}`;
        const resp = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'qwen-audio-turbo',
                input: {
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { audio: dataUri },
                                { text: '请将这段音频完整转写为文字，保留原始语言和口语化表达。只输出转写文字，不要有其他内容。' },
                            ],
                        },
                    ],
                },
            }),
        });
        if (!resp.ok) {
            const err = await resp.text();
            throw new Error(`DashScope ASR failed (${resp.status}): ${err}`);
        }
        const data = await resp.json();
        const content = data.output?.choices?.[0]?.message?.content;
        if (!content)
            return '';
        if (typeof content === 'string')
            return content;
        if (Array.isArray(content)) {
            return content
                .filter((b) => b.text)
                .map((b) => b.text)
                .join('\n');
        }
        return String(content);
    }
}
exports.AlibabaBailianProvider = AlibabaBailianProvider;
//# sourceMappingURL=alibaba-bailian.provider.js.map