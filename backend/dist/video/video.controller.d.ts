import { VideoService } from './video.service';
import { ParseVideoDto } from './dto/parse-video.dto';
import { SaveVideoItemsDto } from './dto/save-video-items.dto';
export declare class VideoController {
    private readonly videoService;
    constructor(videoService: VideoService);
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
}
