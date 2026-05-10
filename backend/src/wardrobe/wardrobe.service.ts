import { Injectable } from '@nestjs/common';
import { LocalDbService } from '../common/services/local-db.service';
import { AddClothingDto } from './dto/add-clothing.dto';
import { UpdateClothingDto } from './dto/update-clothing.dto';

@Injectable()
export class WardrobeService {
  constructor(private localDb: LocalDbService) {}

  async findAll(filters: { category?: string; style?: string; season?: string }) {
    const items = await this.localDb.findAllClothes(filters);
    return { items };
  }

  async findOne(id: number) {
    const item = await this.localDb.findOneCloth(id);
    return { item };
  }

  async add(dto: AddClothingDto) {
    const result = await this.localDb.insertCloth({
      name: dto.name,
      category: dto.category,
      color: dto.color ?? null,
      style: dto.style ?? null,
      season: dto.season ?? null,
      oss_url: dto.oss_url ?? null,
      source: dto.source ?? 'upload',
      taobao_url: dto.taobao_url ?? null,
    });
    return { id: result.id };
  }

  async update(id: number, dto: UpdateClothingDto) {
    const updates: Record<string, any> = {};
    if (dto.category !== undefined) updates.category = dto.category;
    if (dto.color !== undefined) updates.color = dto.color;
    if (dto.style !== undefined) updates.style = dto.style;
    if (dto.season !== undefined) updates.season = dto.season;
    if (dto.name !== undefined) updates.name = dto.name;

    await this.localDb.updateCloth(id, updates);
    return { success: true };
  }
}
