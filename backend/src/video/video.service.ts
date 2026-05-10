import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../common/db/database.module';
import { IAiProvider } from '../common/services/ai/ai.interface';
import { OssService } from '../common/services/oss.service';
import { clothes } from '../common/db/schema';
import { ParseVideoDto } from './dto/parse-video.dto';
import { SaveVideoItemsDto } from './dto/save-video-items.dto';
import { execa } from 'execa';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class VideoService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    @Inject(IAiProvider) private ai: IAiProvider,
    private ossService: OssService,
  ) {}

  async parse(dto: ParseVideoDto) {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dazi-video-'));

    try {
      const videoPath = path.join(tmpDir, 'video.mp4');

      // 1. yt-dlp 下载视频
      await execa('yt-dlp', [dto.url, '-o', videoPath, '--no-check-certificates']);

      // 2. ffmpeg 提取关键帧（每秒 1 帧，最多取前 10 帧控制耗时）
      const framesDir = path.join(tmpDir, 'frames');
      await fs.mkdir(framesDir);
      await execa('ffmpeg', [
        '-i', videoPath,
        '-vf', 'fps=1',
        '-frames:v', '10',
        path.join(framesDir, 'frame_%03d.jpg'),
      ]);

      // 3. 读取所有帧，逐帧调 AI
      const frameFiles = (await fs.readdir(framesDir))
        .filter((f) => f.endsWith('.jpg'))
        .sort();

      const MAX_CONCURRENT = 3;
      const items: any[] = [];

      for (let i = 0; i < frameFiles.length; i += MAX_CONCURRENT) {
        const batch = frameFiles.slice(i, i + MAX_CONCURRENT);
        const results = await Promise.all(
          batch.map(async (file) => {
            const buffer = await fs.readFile(path.join(framesDir, file));
            const base64 = buffer.toString('base64');
            try {
              const info = await this.ai.recognizeClothing(base64);
              return { ...info, image_base64: base64 };
            } catch {
              return null;
            }
          }),
        );
        items.push(...results.filter(Boolean));
      }

      return { items };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }

  async save(dto: SaveVideoItemsDto) {
    const ids: number[] = [];

    for (const item of dto.items) {
      const ossUrl = await this.ossService.uploadFromBase64(item.image_base64);
      const [row] = await this.db
        .insert(clothes)
        .values({
          name: item.name ?? `${item.color}${item.category}`,
          category: item.category,
          color: item.color,
          style: item.style,
          season: item.season,
          ossUrl,
          source: 'video',
        })
        .returning({ id: clothes.id });
      ids.push(row.id);
    }

    return { ids };
  }
}
