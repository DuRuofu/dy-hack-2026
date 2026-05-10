import { Injectable, Inject } from '@nestjs/common';
import { IAiProvider } from '../common/services/ai/ai.interface';
import { LocalDbService } from '../common/services/local-db.service';

@Injectable()
export class RecognizeService {
  constructor(
    @Inject(IAiProvider) private ai: IAiProvider,
    private localDb: LocalDbService,
  ) {}

  async recognize(imageBuffer: Buffer) {
    const base64 = imageBuffer.toString('base64');

    const imageUrl = await this.localDb.saveImage(imageBuffer);
    const info = await this.ai.recognizeClothing(base64);

    return {
      ...info,
      oss_url: imageUrl,
    };
  }
}
