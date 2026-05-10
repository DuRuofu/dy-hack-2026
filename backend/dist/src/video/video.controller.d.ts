import { VideoService } from './video.service';
import { ParseVideoDto } from './dto/parse-video.dto';
import { SaveVideoItemsDto } from './dto/save-video-items.dto';
export declare class VideoController {
    private readonly videoService;
    constructor(videoService: VideoService);
    parse(dto: ParseVideoDto): Promise<{
        items: any[];
    }>;
    save(dto: SaveVideoItemsDto): Promise<{
        ids: number[];
    }>;
}
