import { ConfigService } from '@nestjs/config';
import { IAiProvider, ClothingInfo, OutfitPlan, Evaluation } from './ai.interface';
export declare class AlibabaBailianProvider implements IAiProvider {
    private config;
    private client;
    constructor(config: ConfigService);
    recognizeClothing(imageBase64: string): Promise<ClothingInfo>;
    recommendOutfit(clothes: {
        id: number;
        name: string;
        category: string;
        color: string;
        style: string;
    }[], scene: string): Promise<OutfitPlan[]>;
    evaluateOutfit(clothes: {
        id: number;
        name: string;
        category: string;
        color: string;
        style: string;
    }[]): Promise<Evaluation>;
    transcribeAudio(audioBase64: string): Promise<string>;
}
