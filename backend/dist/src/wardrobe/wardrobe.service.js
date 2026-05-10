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
exports.WardrobeService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../common/db/database.module");
const schema_1 = require("../common/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
let WardrobeService = class WardrobeService {
    constructor(db) {
        this.db = db;
    }
    async findAll(filters) {
        const conditions = [];
        if (filters.category)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.clothes.category, filters.category));
        if (filters.style)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.clothes.style, filters.style));
        if (filters.season)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.clothes.season, filters.season));
        const query = conditions.length
            ? this.db.select().from(schema_1.clothes).where((0, drizzle_orm_1.and)(...conditions))
            : this.db.select().from(schema_1.clothes);
        const items = await query;
        return { items };
    }
    async findOne(id) {
        const [item] = await this.db.select().from(schema_1.clothes).where((0, drizzle_orm_1.eq)(schema_1.clothes.id, id));
        return { item };
    }
    async add(dto) {
        const [row] = await this.db
            .insert(schema_1.clothes)
            .values({
            name: dto.name,
            category: dto.category,
            color: dto.color,
            style: dto.style,
            season: dto.season,
            ossUrl: dto.oss_url,
            source: dto.source ?? 'upload',
            taobaoUrl: dto.taobao_url,
        })
            .returning({ id: schema_1.clothes.id });
        return { id: row.id };
    }
    async update(id, dto) {
        const updateData = {};
        if (dto.category !== undefined)
            updateData.category = dto.category;
        if (dto.color !== undefined)
            updateData.color = dto.color;
        if (dto.style !== undefined)
            updateData.style = dto.style;
        if (dto.season !== undefined)
            updateData.season = dto.season;
        if (dto.name !== undefined)
            updateData.name = dto.name;
        await this.db.update(schema_1.clothes).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.clothes.id, id));
        return { success: true };
    }
};
exports.WardrobeService = WardrobeService;
exports.WardrobeService = WardrobeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [Object])
], WardrobeService);
//# sourceMappingURL=wardrobe.service.js.map