import { Controller, Get, Post, Body } from '@nestjs/common';
import { OutfitService } from './outfit.service';
import { RecommendDto } from './dto/recommend.dto';
import { EvaluateDto } from './dto/evaluate.dto';

@Controller('api/outfit')
export class OutfitController {
  constructor(private readonly outfitService: OutfitService) {}

  @Post('recommend')
  recommend(@Body() dto: RecommendDto) {
    return this.outfitService.recommend(dto);
  }

  @Post('evaluate')
  evaluate(@Body() dto: EvaluateDto) {
    return this.outfitService.evaluate(dto);
  }
}
