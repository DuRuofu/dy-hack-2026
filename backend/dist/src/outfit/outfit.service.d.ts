import { IAiProvider } from '../common/services/ai/ai.interface';
import { RecommendDto } from './dto/recommend.dto';
import { EvaluateDto } from './dto/evaluate.dto';
export declare class OutfitService {
    private db;
    private ai;
    constructor(db: any, ai: IAiProvider);
    recommend(dto: RecommendDto): Promise<{
        outfits: {
            items: any[];
            reason: string;
            score: number;
        }[];
    }>;
    evaluate(dto: EvaluateDto): Promise<import("../common/services/ai/ai.interface").Evaluation>;
}
