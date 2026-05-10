import { pgTable, serial, varchar, text, real, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const clothes = pgTable('clothes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 20 }).notNull(),
  color: varchar('color', { length: 20 }),
  style: varchar('style', { length: 20 }),
  season: varchar('season', { length: 10 }),
  ossUrl: text('oss_url'),
  source: varchar('source', { length: 20 }).default('upload'),
  taobaoUrl: text('taobao_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const outfits = pgTable('outfits', {
  id: serial('id').primaryKey(),
  scene: varchar('scene', { length: 50 }),
  items: jsonb('items').notNull(),
  score: real('score'),
  reason: text('reason'),
  isCustom: boolean('is_custom').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const scenes = pgTable('scenes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  icon: varchar('icon', { length: 10 }),
  description: text('description'),
});
