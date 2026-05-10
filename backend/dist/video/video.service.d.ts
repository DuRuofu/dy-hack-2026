import { IAiProvider } from '../common/services/ai/ai.interface';
import { LocalDbService } from '../common/services/local-db.service';
import { ParseVideoDto } from './dto/parse-video.dto';
import { SaveVideoItemsDto } from './dto/save-video-items.dto';
export declare class VideoService {
    private localDb;
    private ai;
    constructor(localDb: LocalDbService, ai: IAiProvider);
    parse(dto: ParseVideoDto): Promise<{
        items: any[];
        cached: boolean;
    } | {
        items: any[];
        cached?: undefined;
    }>;
    save(dto: SaveVideoItemsDto): Promise<{
        ids: number[];
    }>;
    private urlHash;
    private getCachePath;
    private loadCache;
    private saveCache;
}
