import { IAiProvider } from '../common/services/ai/ai.interface';
import { OssService } from '../common/services/oss.service';
export declare class RecognizeService {
    private ai;
    private ossService;
    constructor(ai: IAiProvider, ossService: OssService);
    recognize(imageBuffer: Buffer): Promise<{
        oss_url: string;
        category: string;
        color: string;
        style: string;
        season: string;
        confidence?: number;
        name?: string;
    }>;
}
