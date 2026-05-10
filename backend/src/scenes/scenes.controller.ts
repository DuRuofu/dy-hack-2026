import { Controller, Get } from '@nestjs/common';
import { ScenesService } from './scenes.service';

@Controller('api/scenes')
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Get()
  findAll() {
    return this.scenesService.findAll();
  }
}
