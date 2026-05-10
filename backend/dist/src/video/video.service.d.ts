import { IAiProvider } from '../common/services/ai/ai.interface';
import { OssService } from '../common/services/oss.service';
import { ParseVideoDto } from './dto/parse-video.dto';
import { SaveVideoItemsDto } from './dto/save-video-items.dto';
export declare class VideoService {
    private db;
    private ai;
    private ossService;
    constructor(db: any, ai: IAiProvider, ossService: OssService);
    parse(dto: ParseVideoDto): Promise<{
        items: any[];
    }>;
    save(dto: SaveVideoItemsDto): Promise<{
        ids: number[];
    }>;
}
