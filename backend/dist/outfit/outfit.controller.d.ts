import { OutfitService } from './outfit.service';
import { RecommendDto } from './dto/recommend.dto';
import { EvaluateDto } from './dto/evaluate.dto';
export declare class OutfitController {
    private readonly outfitService;
    constructor(outfitService: OutfitService);
    recommend(dto: RecommendDto): Promise<{
        outfits: {
            items: any[];
            reason: string;
            score: number;
        }[];
    }>;
    evaluate(dto: EvaluateDto): Promise<import("../common/services/ai/ai.interface").Evaluation>;
}
