import { Injectable, Inject } from '@nestjs/common';
import { IAiProvider } from '../common/services/ai/ai.interface';
import { LocalDbService } from '../common/services/local-db.service';
import { RecommendDto } from './dto/recommend.dto';
import { EvaluateDto } from './dto/evaluate.dto';

@Injectable()
export class OutfitService {
  constructor(
    private localDb: LocalDbService,
    @Inject(IAiProvider) private ai: IAiProvider,
  ) {}

  async recommend(dto: RecommendDto) {
    const allClothes = await this.localDb.findAllClothes();

    if (allClothes.length === 0) {
      return { outfits: [] };
    }

    // Format for AI: only send needed fields
    const formatted = allClothes.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      color: c.color,
      style: c.style,
    }));

    const plans = await this.ai.recommendOutfit(formatted, dto.scene);

    const enriched = await Promise.all(
      plans.map(async (plan) => {
        const clotheIds = plan.items.map((i) => i.clothe_id);
        const details = clotheIds.length
          ? await this.localDb.findClothesByIds(clotheIds)
          : [];

        const itemMap = new Map(details.map((d) => [d.id, d]));

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
    const selected = await this.localDb.findClothesByIds(dto.items);

    if (selected.length === 0) {
      return { score: 0, pros: [], cons: ['未找到所选衣物'], suggestion: '请先添加衣物到衣橱' };
    }

    const formatted = selected.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      color: c.color,
      style: c.style,
    }));

    return this.ai.evaluateOutfit(formatted);
  }
}
