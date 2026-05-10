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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutfitService = void 0;
const common_1 = require("@nestjs/common");
const ai_interface_1 = require("../common/services/ai/ai.interface");
const local_db_service_1 = require("../common/services/local-db.service");
let OutfitService = class OutfitService {
    constructor(localDb, ai) {
        this.localDb = localDb;
        this.ai = ai;
    }
    async recommend(dto) {
        const allClothes = await this.localDb.findAllClothes();
        if (allClothes.length === 0) {
            return { outfits: [] };
        }
        const formatted = allClothes.map((c) => ({
            id: c.id,
            name: c.name,
            category: c.category,
            color: c.color,
            style: c.style,
        }));
        const plans = await this.ai.recommendOutfit(formatted, dto.scene);
        const enriched = await Promise.all(plans.map(async (plan) => {
            const clotheIds = plan.items.map((i) => i.clothe_id);
            const details = clotheIds.length
                ? await this.localDb.findClothesByIds(clotheIds)
                : [];
            const itemMap = new Map(details.map((d) => [d.id, d]));
            return {
                items: plan.items.map((i) => ({
                    ...i,
                    ...(itemMap.get(i.clothe_id) ?? {}),
                })),
                reason: plan.reason,
                score: plan.score,
            };
        }));
        return { outfits: enriched };
    }
    async evaluate(dto) {
        const selected = await this.localDb.findClothesByIds(dto.items);
        if (selected.length === 0) {
            return { score: 0, pros: [], cons: ['未找到所选衣物'], suggestion: '请先添加衣物到衣橱' };
        }
        const formatted = selected.map((c) => ({
            id: c.id,
            name: c.name,
            category: c.category,
            color: c.color,
            style: c.style,
        }));
        return this.ai.evaluateOutfit(formatted);
    }
};
exports.OutfitService = OutfitService;
exports.OutfitService = OutfitService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(ai_interface_1.IAiProvider)),
    __metadata("design:paramtypes", [local_db_service_1.LocalDbService,
        ai_interface_1.IAiProvider])
], OutfitService);
//# sourceMappingURL=outfit.service.js.map