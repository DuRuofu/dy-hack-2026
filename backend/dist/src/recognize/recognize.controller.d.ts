import { RecognizeService } from './recognize.service';
export declare class RecognizeController {
    private readonly recognizeService;
    constructor(recognizeService: RecognizeService);
    recognize(file: any): Promise<{
        oss_url: string;
        category: string;
        color: string;
        style: string;
        season: string;
        confidence?: number;
        name?: string;
    }>;
}
