import { Injectable, Inject } from '@nestjs/common';
import { IAiProvider } from '../common/services/ai/ai.interface';
import { OssService } from '../common/services/oss.service';

@Injectable()
export class RecognizeService {
  constructor(
    @Inject(IAiProvider) private ai: IAiProvider,
    private ossService: OssService,
  ) {}

  async recognize(imageBuffer: Buffer) {
    const base64 = imageBuffer.toString('base64');

    const ossUrl = await this.ossService.upload(imageBuffer);
    const info = await this.ai.recognizeClothing(base64);

    return {
      ...info,
      oss_url: ossUrl,
    };
  }
}
