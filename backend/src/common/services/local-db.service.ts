import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

const DB_DIR = path.resolve(process.cwd(), 'db');
const IMAGES_DIR = path.join(DB_DIR, 'images');

export interface ClothingItem {
  id: number;
  name: string;
  category: string;
  color: string | null;
  style: string | null;
  season: string | null;
  oss_url: string | null;
  source: string;
  taobao_url: string | null;
  created_at: string;
}

export interface Scene {
  id: number;
  name: string;
  icon: string | null;
  description: string | null;
}

export interface Outfit {
  id: number;
  scene: string | null;
  items: any[];
  score: number | null;
  reason: string | null;
  is_custom: boolean;
  created_at: string;
}

interface DbFile<T> {
  data: T[];
  nextId: number;
}

@Injectable()
export class LocalDbService implements OnModuleInit {
  private clothesFile = path.join(DB_DIR, 'clothes.json');
  private scenesFile = path.join(DB_DIR, 'scenes.json');
  private outfitsFile = path.join(DB_DIR, 'outfits.json');

  async onModuleInit() {
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    // Initialize files if they don't exist
    await this.initFile(this.clothesFile, this.defaultClothes());
    await this.initFile(this.scenesFile, this.defaultScenes());
    await this.initFile(this.outfitsFile, { data: [], nextId: 1 });
  }

  private async initFile<T>(filePath: string, defaultData: DbFile<T>) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
    }
  }

  private defaultScenes(): DbFile<Scene> {
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

  private defaultClothes(): DbFile<ClothingItem> {
    return { data: [], nextId: 1 };
  }

  // --- Generic JSON read/write ---

  private async readJson<T>(filePath: string): Promise<DbFile<T>> {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  }

  private async writeJson<T>(filePath: string, db: DbFile<T>) {
    await fs.writeFile(filePath, JSON.stringify(db, null, 2), 'utf-8');
  }

  // --- Clothes CRUD ---

  async findAllClothes(filters?: { category?: string; style?: string; season?: string }): Promise<ClothingItem[]> {
    const db = await this.readJson<ClothingItem>(this.clothesFile);
    let items = db.data;
    if (filters?.category) items = items.filter((i) => i.category === filters.category);
    if (filters?.style) items = items.filter((i) => i.style === filters.style);
    if (filters?.season) items = items.filter((i) => i.season === filters.season);
    return items;
  }

  async findClothesByIds(ids: number[]): Promise<ClothingItem[]> {
    const db = await this.readJson<ClothingItem>(this.clothesFile);
    return db.data.filter((i) => ids.includes(i.id));
  }

  async findOneCloth(id: number): Promise<ClothingItem | undefined> {
    const db = await this.readJson<ClothingItem>(this.clothesFile);
    return db.data.find((i) => i.id === id);
  }

  async insertCloth(item: Omit<ClothingItem, 'id' | 'created_at'>): Promise<{ id: number }> {
    const db = await this.readJson<ClothingItem>(this.clothesFile);
    const id = db.nextId++;
    const row: ClothingItem = {
      id,
      ...item,
      created_at: new Date().toISOString(),
    };
    db.data.push(row);
    await this.writeJson(this.clothesFile, db);
    return { id };
  }

  async updateCloth(id: number, updates: Partial<ClothingItem>): Promise<boolean> {
    const db = await this.readJson<ClothingItem>(this.clothesFile);
    const idx = db.data.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    db.data[idx] = { ...db.data[idx], ...updates };
    await this.writeJson(this.clothesFile, db);
    return true;
  }

  // --- Scenes ---

  async findAllScenes(): Promise<Scene[]> {
    const db = await this.readJson<Scene>(this.scenesFile);
    return db.data;
  }

  // --- Image storage ---

  async saveImage(buffer: Buffer, ext = 'jpg'): Promise<string> {
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(IMAGES_DIR, filename);
    await fs.writeFile(filepath, buffer);
    return `/images/${filename}`;
  }

  async saveImageFromBase64(base64: string, ext = 'jpg'): Promise<string> {
    const buffer = Buffer.from(base64, 'base64');
    return this.saveImage(buffer, ext);
  }
}
