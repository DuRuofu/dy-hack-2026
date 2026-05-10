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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalDbService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const DB_DIR = path.resolve(process.cwd(), 'db');
const IMAGES_DIR = path.join(DB_DIR, 'images');
let LocalDbService = class LocalDbService {
    constructor() {
        this.clothesFile = path.join(DB_DIR, 'clothes.json');
        this.scenesFile = path.join(DB_DIR, 'scenes.json');
        this.outfitsFile = path.join(DB_DIR, 'outfits.json');
    }
    async onModuleInit() {
        await fs.mkdir(DB_DIR, { recursive: true });
        await fs.mkdir(IMAGES_DIR, { recursive: true });
        await this.initFile(this.clothesFile, this.defaultClothes());
        await this.initFile(this.scenesFile, this.defaultScenes());
        await this.initFile(this.outfitsFile, { data: [], nextId: 1 });
    }
    async initFile(filePath, defaultData) {
        try {
            await fs.access(filePath);
        }
        catch {
            await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
        }
    }
    defaultScenes() {
        return {
            data: [
                { id: 1, name: '通勤上班', icon: '', description: '适合日常通勤的商务或简约穿搭' },
                { id: 2, name: '约会出行', icon: '', description: '浪漫约会或外出游玩的精致搭配' },
                { id: 3, name: '运动健身', icon: '', description: '适合健身房或户外运动的功能性穿搭' },
                { id: 4, name: '日常休闲', icon: '', description: '居家或逛街的舒适随性穿搭' },
                { id: 5, name: '朋友聚会', icon: '', description: '社交场合的时尚得体穿搭' },
            ],
            nextId: 6,
        };
    }
    defaultClothes() {
        return { data: [], nextId: 1 };
    }
    async readJson(filePath) {
        const raw = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(raw);
    }
    async writeJson(filePath, db) {
        await fs.writeFile(filePath, JSON.stringify(db, null, 2), 'utf-8');
    }
    async findAllClothes(filters) {
        const db = await this.readJson(this.clothesFile);
        let items = db.data;
        if (filters?.category)
            items = items.filter((i) => i.category === filters.category);
        if (filters?.style)
            items = items.filter((i) => i.style === filters.style);
        if (filters?.season)
            items = items.filter((i) => i.season === filters.season);
        return items;
    }
    async findClothesByIds(ids) {
        const db = await this.readJson(this.clothesFile);
        return db.data.filter((i) => ids.includes(i.id));
    }
    async findOneCloth(id) {
        const db = await this.readJson(this.clothesFile);
        return db.data.find((i) => i.id === id);
    }
    async insertCloth(item) {
        const db = await this.readJson(this.clothesFile);
        const id = db.nextId++;
        const row = {
            id,
            ...item,
            created_at: new Date().toISOString(),
        };
        db.data.push(row);
        await this.writeJson(this.clothesFile, db);
        return { id };
    }
    async updateCloth(id, updates) {
        const db = await this.readJson(this.clothesFile);
        const idx = db.data.findIndex((i) => i.id === id);
        if (idx === -1)
            return false;
        db.data[idx] = { ...db.data[idx], ...updates };
        await this.writeJson(this.clothesFile, db);
        return true;
    }
    async findAllScenes() {
        const db = await this.readJson(this.scenesFile);
        return db.data;
    }
    async saveImage(buffer, ext = 'jpg') {
        const filename = `${(0, crypto_1.randomUUID)()}.${ext}`;
        const filepath = path.join(IMAGES_DIR, filename);
        await fs.writeFile(filepath, buffer);
        return `/images/${filename}`;
    }
    async saveImageFromBase64(base64, ext = 'jpg') {
        const buffer = Buffer.from(base64, 'base64');
        return this.saveImage(buffer, ext);
    }
};
exports.LocalDbService = LocalDbService;
exports.LocalDbService = LocalDbService = __decorate([
    (0, common_1.Injectable)()
], LocalDbService);
//# sourceMappingURL=local-db.service.js.map