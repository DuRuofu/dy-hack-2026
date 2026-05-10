"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scenes = exports.outfits = exports.clothes = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.clothes = (0, pg_core_1.pgTable)('clothes', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    category: (0, pg_core_1.varchar)('category', { length: 20 }).notNull(),
    color: (0, pg_core_1.varchar)('color', { length: 20 }),
    style: (0, pg_core_1.varchar)('style', { length: 20 }),
    season: (0, pg_core_1.varchar)('season', { length: 10 }),
    ossUrl: (0, pg_core_1.text)('oss_url'),
    source: (0, pg_core_1.varchar)('source', { length: 20 }).default('upload'),
    taobaoUrl: (0, pg_core_1.text)('taobao_url'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
exports.outfits = (0, pg_core_1.pgTable)('outfits', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    scene: (0, pg_core_1.varchar)('scene', { length: 50 }),
    items: (0, pg_core_1.jsonb)('items').notNull(),
    score: (0, pg_core_1.real)('score'),
    reason: (0, pg_core_1.text)('reason'),
    isCustom: (0, pg_core_1.boolean)('is_custom').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
exports.scenes = (0, pg_core_1.pgTable)('scenes', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 50 }).notNull(),
    icon: (0, pg_core_1.varchar)('icon', { length: 10 }),
    description: (0, pg_core_1.text)('description'),
});
//# sourceMappingURL=schema.js.map