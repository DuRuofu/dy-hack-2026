import { OnModuleInit } from '@nestjs/common';
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
export declare class LocalDbService implements OnModuleInit {
    private clothesFile;
    private scenesFile;
    private outfitsFile;
    onModuleInit(): Promise<void>;
    private initFile;
    private defaultScenes;
    private defaultClothes;
    private readJson;
    private writeJson;
    findAllClothes(filters?: {
        category?: string;
        style?: string;
        season?: string;
    }): Promise<ClothingItem[]>;
    findClothesByIds(ids: number[]): Promise<ClothingItem[]>;
    findOneCloth(id: number): Promise<ClothingItem | undefined>;
    insertCloth(item: Omit<ClothingItem, 'id' | 'created_at'>): Promise<{
        id: number;
    }>;
    updateCloth(id: number, updates: Partial<ClothingItem>): Promise<boolean>;
    findAllScenes(): Promise<Scene[]>;
    saveImage(buffer: Buffer, ext?: string): Promise<string>;
    saveImageFromBase64(base64: string, ext?: string): Promise<string>;
}
