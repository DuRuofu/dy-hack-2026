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
const database_module_1 = require("../common/db/database.module");
const ai_interface_1 = require("../common/services/ai/ai.interface");
const oss_service_1 = require("../common/services/oss.service");
const schema_1 = require("../common/db/schema");
const execa_1 = require("execa");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
let VideoService = class VideoService {
    constructor(db, ai, ossService) {
        this.db = db;
        this.ai = ai;
        this.ossService = ossService;
    }
    async parse(dto) {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dazi-video-'));
        try {
            const videoPath = path.join(tmpDir, 'video.mp4');
            await (0, execa_1.execa)('yt-dlp', [dto.url, '-o', videoPath, '--no-check-certificates']);
            const framesDir = path.join(tmpDir, 'frames');
            await fs.mkdir(framesDir);
            await (0, execa_1.execa)('ffmpeg', [
                '-i', videoPath,
                '-vf', 'fps=1',
                '-frames:v', '10',
                path.join(framesDir, 'frame_%03d.jpg'),
            ]);
            const frameFiles = (await fs.readdir(framesDir))
                .filter((f) => f.endsWith('.jpg'))
                .sort();
            const MAX_CONCURRENT = 3;
            const items = [];
            for (let i = 0; i < frameFiles.length; i += MAX_CONCURRENT) {
                const batch = frameFiles.slice(i, i + MAX_CONCURRENT);
                const results = await Promise.all(batch.map(async (file) => {
                    const buffer = await fs.readFile(path.join(framesDir, file));
                    const base64 = buffer.toString('base64');
                    try {
                        const info = await this.ai.recognizeClothing(base64);
                        return { ...info, image_base64: base64 };
                    }
                    catch {
                        return null;
                    }
                }));
                items.push(...results.filter(Boolean));
            }
            return { items };
        }
        finally {
            await fs.rm(tmpDir, { recursive: true, force: true });
        }
    }
    async save(dto) {
        const ids = [];
        for (const item of dto.items) {
            const ossUrl = await this.ossService.uploadFromBase64(item.image_base64);
            const [row] = await this.db
                .insert(schema_1.clothes)
                .values({
                name: item.name ?? `${item.color}${item.category}`,
                category: item.category,
                color: item.color,
                style: item.style,
                season: item.season,
                ossUrl,
                source: 'video',
            })
                .returning({ id: schema_1.clothes.id });
            ids.push(row.id);
        }
        return { ids };
    }
};
exports.VideoService = VideoService;
exports.VideoService = VideoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_CONNECTION)),
    __param(1, (0, common_1.Inject)(ai_interface_1.IAiProvider)),
    __metadata("design:paramtypes", [Object, ai_interface_1.IAiProvider,
        oss_service_1.OssService])
], VideoService);
//# sourceMappingURL=video.service.js.map