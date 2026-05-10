export interface ClothingInfo {
    category: string;
    color: string;
    style: string;
    season: string;
    confidence?: number;
    name?: string;
}
export interface OutfitItem {
    clothe_id: number;
    role: string;
}
export interface OutfitPlan {
    items: OutfitItem[];
    reason: string;
    score: number;
}
export interface Evaluation {
    score: number;
    pros: string[];
    cons: string[];
    suggestion: string;
}
export declare abstract class IAiProvider {
    abstract recognizeClothing(imageBase64: string): Promise<ClothingInfo>;
    abstract recommendOutfit(clothes: {
        id: number;
        name: string;
        category: string;
        color: string;
        style: string;
    }[], scene: string): Promise<OutfitPlan[]>;
    abstract evaluateOutfit(clothes: {
        id: number;
        name: string;
        category: string;
        color: string;
        style: string;
    }[]): Promise<Evaluation>;
    abstract transcribeAudio(audioBase64: string): Promise<string>;
}
