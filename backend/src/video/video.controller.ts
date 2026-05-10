import { Controller, Post, Body } from '@nestjs/common';
import { VideoService } from './video.service';
import { ParseVideoDto } from './dto/parse-video.dto';
import { SaveVideoItemsDto } from './dto/save-video-items.dto';

@Controller('api/video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('parse')
  parse(@Body() dto: ParseVideoDto) {
    return this.videoService.parse(dto);
  }

  @Post('save')
  save(@Body() dto: SaveVideoItemsDto) {
    return this.videoService.save(dto);
  }
}
