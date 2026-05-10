import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../common/db/database.module';
import { clothes } from '../common/db/schema';
import { eq, and } from 'drizzle-orm';
import { AddClothingDto } from './dto/add-clothing.dto';
import { UpdateClothingDto } from './dto/update-clothing.dto';

@Injectable()
export class WardrobeService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  async findAll(filters: { category?: string; style?: string; season?: string }) {
    const conditions = [];
    if (filters.category) conditions.push(eq(clothes.category, filters.category));
    if (filters.style) conditions.push(eq(clothes.style, filters.style));
    if (filters.season) conditions.push(eq(clothes.season, filters.season));

    const query = conditions.length
      ? this.db.select().from(clothes).where(and(...conditions))
      : this.db.select().from(clothes);

    const items = await query;
    return { items };
  }

  async findOne(id: number) {
    const [item] = await this.db.select().from(clothes).where(eq(clothes.id, id));
    return { item };
  }

  async add(dto: AddClothingDto) {
    const [row] = await this.db
      .insert(clothes)
      .values({
        name: dto.name,
        category: dto.category,
        color: dto.color,
        style: dto.style,
        season: dto.season,
        ossUrl: dto.oss_url,
        source: dto.source ?? 'upload',
        taobaoUrl: dto.taobao_url,
      })
      .returning({ id: clothes.id });

    return { id: row.id };
  }

  async update(id: number, dto: UpdateClothingDto) {
    const updateData: Record<string, any> = {};
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.style !== undefined) updateData.style = dto.style;
    if (dto.season !== undefined) updateData.season = dto.season;
    if (dto.name !== undefined) updateData.name = dto.name;

    await this.db.update(clothes).set(updateData).where(eq(clothes.id, id));
    return { success: true };
  }
}
