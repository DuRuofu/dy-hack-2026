"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OssService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ali_oss_1 = __importDefault(require("ali-oss"));
const crypto_1 = require("crypto");
let OssService = class OssService {
    constructor(config) {
        this.config = config;
        this.client = new ali_oss_1.default({
            region: this.config.getOrThrow('OSS_REGION'),
            accessKeyId: this.config.getOrThrow('OSS_ACCESS_KEY_ID'),
            accessKeySecret: this.config.getOrThrow('OSS_ACCESS_KEY_SECRET'),
        });
        this.bucket = this.config.getOrThrow('OSS_BUCKET');
    }
    async upload(buffer, ext = 'jpg') {
        const key = `clothes/${(0, crypto_1.randomUUID)()}.${ext}`;
        const result = await this.client.put(key, buffer, {
            bucket: this.bucket,
        });
        return result.url;
    }
    async uploadFromBase64(base64, ext = 'jpg') {
        const buffer = Buffer.from(base64, 'base64');
        return this.upload(buffer, ext);
    }
};
exports.OssService = OssService;
exports.OssService = OssService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OssService);
//# sourceMappingURL=oss.service.js.map