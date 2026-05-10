"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const common_1 = require("@nestjs/common");
const ai_interface_1 = require("../common/services/ai/ai.interface");
const local_db_service_1 = require("../common/services/local-db.service");
const execa_1 = require("execa");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const crypto_1 = require("crypto");
const CACHE_DIR = path.join(process.cwd(), 'db', 'video-cache');
let VideoService = class VideoService {
    constructor(localDb, ai) {
        this.localDb = localDb;
        this.ai = ai;
    }
    async parse(dto) {
        const outfitCount = Math.max(1, dto.outfitCount || 3);
        const hash = this.urlHash(dto.url);
        const cached = this.loadCache(hash);
        if (cached) {
            return { items: cached.items, cached: true };
        }
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dazi-video-'));
        try {
            const videoPath = path.join(tmpDir, 'video.mp4');
            await (0, execa_1.execa)('yt-dlp', [
                dto.url,
                '-o', videoPath,
                '--no-check-certificates',
                '-f', 'bestvideo+bestaudio/best',
                '--merge-output-format', 'mp4',
            ]);
            let duration = 60;
            try {
                const { stdout } = await (0, execa_1.execa)('ffprobe', [
                    '-v', 'error',
                    '-show_entries', 'format=duration',
                    '-of', 'default=noprint_wrappers=1:nokey=1',
                    videoPath,
                ]);
                duration = parseFloat(stdout.trim()) || 60;
            }
            catch { }
            const margin = Math.min(2, duration * 0.05);
            const usableStart = margin;
            const usableEnd = duration - margin;
            const usableDuration = usableEnd - usableStart;
            const framesDir = path.join(tmpDir, 'frames');
            await fs.mkdir(framesDir);
            const frameCount = Math.min(outfitCount, 10);
            const segmentDuration = usableDuration / frameCount;
            for (let i = 0; i < frameCount; i++) {
                const timestamp = usableStart + segmentDuration * (i + 0.5);
                const outFile = path.join(framesDir, `frame_${String(i + 1).padStart(3, '0')}.jpg`);
                await (0, execa_1.execa)('ffmpeg', [
                    '-ss', timestamp.toFixed(2),
                    '-i', videoPath,
                    '-frames:v', '1',
                    '-q:v', '2',
                    '-y',
                    outFile,
                ]);
            }
            let transcript;
            try {
                const audioPath = path.join(tmpDir, 'audio.mp3');
                await (0, execa_1.execa)('ffmpeg', [
                    '-i', videoPath,
                    '-vn',
                    '-acodec', 'libmp3lame',
                    '-q:a', '2',
                    '-y',
                    audioPath,
                ]);
                const audioBuffer = await fs.readFile(audioPath);
                const audioBase64 = audioBuffer.toString('base64');
                transcript = await this.ai.transcribeAudio(audioBase64);
            }
            catch { }
            const frameFiles = (await fs.readdir(framesDir))
                .filter((f) => f.endsWith('.jpg'))
                .sort();
            const allItems = [];
            for (let i = 0; i < frameFiles.length; i++) {
                const buffer = await fs.readFile(path.join(framesDir, frameFiles[i]));
                const base64 = buffer.toString('base64');
                try {
                    const info = await this.ai.recognizeClothing(base64);
                    allItems.push({ ...info, image_base64: base64, frame_index: i });
                }
                catch { }
            }
            const seen = new Map();
            for (const item of allItems) {
                const key = `${item.category}|${item.color}`;
                if (!seen.has(key)) {
                    seen.set(key, item);
                }
            }
            const deduplicated = Array.from(seen.values());
            this.saveCache(hash, { items: allItems, deduplicated, transcript });
            return { items: allItems };
        }
        finally {
            await fs.rm(tmpDir, { recursive: true, force: true });
        }
    }
    async save(dto) {
        const ids = [];
        for (const item of dto.items) {
            const imageUrl = await this.localDb.saveImageFromBase64(item.image_base64);
            const result = await this.localDb.insertCloth({
                name: item.name ?? `${item.color || ''}${item.category || '衣物'}`,
                category: item.category,
                color: item.color ?? null,
                style: item.style ?? null,
                season: item.season ?? null,
                material: item.material ?? null,
                description: item.description ?? null,
                oss_url: imageUrl,
                source: 'video',
                taobao_url: null,
            });
            ids.push(result.id);
        }
        return { ids };
    }
    urlHash(url) {
        return (0, crypto_1.createHash)('md5').update(url).digest('hex').slice(0, 12);
    }
    getCachePath(hash) {
        return path.join(CACHE_DIR, `${hash}.json`);
    }
    loadCache(hash) {
        try {
            const raw = require('fs').readFileSync(this.getCachePath(hash), 'utf-8');
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    saveCache(hash, result) {
        try {
            require('fs').mkdirSync(CACHE_DIR, { recursive: true });
            require('fs').writeFileSync(this.getCachePath(hash), JSON.stringify(result, null, 2));
        }
        catch { }
    }
};
exports.VideoService = VideoService;
exports.VideoService = VideoService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(ai_interface_1.IAiProvider)),
    __metadata("design:paramtypes", [local_db_service_1.LocalDbService,
        ai_interface_1.IAiProvider])
], VideoService);
//# sourceMappingURL=video.service.js.map