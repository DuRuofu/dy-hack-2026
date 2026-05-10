import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../common/db/database.module';
import { IAiProvider } from '../common/services/ai/ai.interface';
import { clothes, outfits } from '../common/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { RecommendDto } from './dto/recommend.dto';
import { EvaluateDto } from './dto/evaluate.dto';

@Injectable()
export class OutfitService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    @Inject(IAiProvider) private ai: IAiProvider,
  ) {}

  async recommend(dto: RecommendDto) {
    const allClothes = await this.db
      .select({ id: clothes.id, name: clothes.name, category: clothes.category, color: clothes.color, style: clothes.style })
      .from(clothes);

    if (allClothes.length === 0) {
      return { outfits: [] };
    }

    const plans = await this.ai.recommendOutfit(allClothes, dto.scene);

    const enriched = await Promise.all(
      plans.map(async (plan) => {
        const clotheIds = plan.items.map((i) => i.clothe_id);
        const details = clotheIds.length
          ? await this.db
              .select({ id: clothes.id, name: clothes.name, category: clothes.category, color: clothes.color, ossUrl: clothes.ossUrl })
              .from(clothes)
              .where(inArray(clothes.id, clotheIds))
          : [];

        const itemMap = new Map(details.map((d: any) => [d.id, d]));

        return {
          items: plan.items.map((i) => ({
            ...i,
            ...((itemMap.get(i.clothe_id) as any) ?? {}),
          })),
          reason: plan.reason,
          score: plan.score,
        };
      }),
    );

    return { outfits: enriched };
  }

  async evaluate(dto: EvaluateDto) {
    const selected = await this.db
      .select({ id: clothes.id, name: clothes.name, category: clothes.category, color: clothes.color, style: clothes.style })
      .from(clothes)
      .where(inArray(clothes.id, dto.items));

    if (selected.length === 0) {
      return { score: 0, pros: [], cons: ['未找到所选衣物'], suggestion: '请先添加衣物到衣橱' };
    }

    return this.ai.evaluateOutfit(selected);
  }
}
