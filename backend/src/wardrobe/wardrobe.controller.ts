import { Controller, Get, Post, Put, Param, Query, Body, ParseIntPipe } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';
import { AddClothingDto } from './dto/add-clothing.dto';
import { UpdateClothingDto } from './dto/update-clothing.dto';

@Controller('api/wardrobe')
export class WardrobeController {
  constructor(private readonly wardrobeService: WardrobeService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('style') style?: string,
    @Query('season') season?: string,
  ) {
    return this.wardrobeService.findAll({ category, style, season });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wardrobeService.findOne(id);
  }

  @Post()
  add(@Body() dto: AddClothingDto) {
    return this.wardrobeService.add(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClothingDto,
  ) {
    return this.wardrobeService.update(id, dto);
  }
}
