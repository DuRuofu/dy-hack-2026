import { IAiProvider } from '../common/services/ai/ai.interface';
import { LocalDbService } from '../common/services/local-db.service';
export declare class RecognizeService {
    private ai;
    private localDb;
    constructor(ai: IAiProvider, localDb: LocalDbService);
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
