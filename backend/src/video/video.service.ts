import { Injectable, Inject } from '@nestjs/common';
import { IAiProvider } from '../common/services/ai/ai.interface';
import { LocalDbService } from '../common/services/local-db.service';
import { ParseVideoDto } from './dto/parse-video.dto';
import { SaveVideoItemsDto } from './dto/save-video-items.dto';
import { execa } from 'execa';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { createHash } from 'crypto';

const CACHE_DIR = path.join(process.cwd(), 'db', 'video-cache');

interface CachedResult {
  items: any[];
  deduplicated: any[];
  transcript?: string;
  meta?: any;
}

@Injectable()
export class VideoService {
  constructor(
    private localDb: LocalDbService,
    @Inject(IAiProvider) private ai: IAiProvider,
  ) {}

  async parse(dto: ParseVideoDto) {
    const outfitCount = Math.max(1, dto.outfitCount || 3);
    const hash = this.urlHash(dto.url);

    // Check cache
    const cached = this.loadCache(hash);
    if (cached) {
      return { items: cached.items, cached: true };
    }

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dazi-video-'));

    try {
      const videoPath = path.join(tmpDir, 'video.mp4');

      // 1. Download video with yt-dlp
      await execa('yt-dlp', [
        dto.url,
        '-o', videoPath,
        '--no-check-certificates',
        '-f', 'bestvideo+bestaudio/best',
        '--merge-output-format', 'mp4',
      ]);

      // 2. Get video duration via ffprobe
      let duration = 60; // default fallback
      try {
        const { stdout } = await execa('ffprobe', [
          '-v', 'error',
          '-show_entries', 'format=duration',
          '-of', 'default=noprint_wrappers=1:nokey=1',
          videoPath,
        ]);
        duration = parseFloat(stdout.trim()) || 60;
      } catch { /* use default */ }

      // 3. Extract frames (skip intro/outro ~5% each side, evenly distribute)
      const margin = Math.min(2, duration * 0.05);
      const usableStart = margin;
      const usableEnd = duration - margin;
      const usableDuration = usableEnd - usableStart;

      const framesDir = path.join(tmpDir, 'frames');
      await fs.mkdir(framesDir);

      const frameCount = Math.min(outfitCount, 10);
      const segmentDuration = usableDuration / frameCount;

      for (let i = 0; i < frameCount; i++) {
        const timestamp = usableStart + segmentDuration * (i + 0.5);
        const outFile = path.join(framesDir, `frame_${String(i + 1).padStart(3, '0')}.jpg`);
        await execa('ffmpeg', [
          '-ss', timestamp.toFixed(2),
          '-i', videoPath,
          '-frames:v', '1',
          '-q:v', '2',
          '-y',
          outFile,
        ]);
      }

      // 4. Extract audio and transcribe
      let transcript: string | undefined;
      try {
        const audioPath = path.join(tmpDir, 'audio.mp3');
        await execa('ffmpeg', [
          '-i', videoPath,
          '-vn',
          '-acodec', 'libmp3lame',
          '-q:a', '2',
          '-y',
          audioPath,
        ]);
        const audioBuffer = await fs.readFile(audioPath);
        const audioBase64 = audioBuffer.toString('base64');
        transcript = await this.ai.transcribeAudio(audioBase64);
      } catch { /* audio extraction/transcription is optional */ }

      // 5. Read frames and recognize clothing (with transcript)
      const frameFiles = (await fs.readdir(framesDir))
        .filter((f) => f.endsWith('.jpg'))
        .sort();

      const allItems: any[] = [];

      for (let i = 0; i < frameFiles.length; i++) {
        const buffer = await fs.readFile(path.join(framesDir, frameFiles[i]));
        const base64 = buffer.toString('base64');
        try {
          const info = await this.ai.recognizeClothing(base64);
          allItems.push({ ...info, image_base64: base64, frame_index: i });
        } catch { /* skip failed frames */ }
      }

      // 6. Deduplicate by category + color
      const seen = new Map<string, any>();
      for (const item of allItems) {
        const key = `${item.category}|${item.color}`;
        if (!seen.has(key)) {
          seen.set(key, item);
        }
      }
      const deduplicated = Array.from(seen.values());

      // 7. Save to cache
      this.saveCache(hash, { items: allItems, deduplicated, transcript });

      return { items: allItems };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }

  async save(dto: SaveVideoItemsDto) {
    const ids: number[] = [];

    for (const item of dto.items) {
      const imageUrl = await this.localDb.saveImageFromBase64(item.image_base64);
      const result = await this.localDb.insertCloth({
        name: item.name ?? `${item.color || ''}${item.category || '衣物'}`,
        category: item.category,
        color: item.color ?? null,
        style: item.style ?? null,
        season: item.season ?? null,
        material: item.material ?? null,
        description: item.description ?? null,
        oss_url: imageUrl,
        source: 'video',
        taobao_url: null,
      });
      ids.push(result.id);
    }

    return { ids };
  }

  private urlHash(url: string): string {
    return createHash('md5').update(url).digest('hex').slice(0, 12);
  }

  private getCachePath(hash: string): string {
    return path.join(CACHE_DIR, `${hash}.json`);
  }

  private loadCache(hash: string): CachedResult | null {
    try {
      const raw = require('fs').readFileSync(this.getCachePath(hash), 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private saveCache(hash: string, result: CachedResult) {
    try {
      require('fs').mkdirSync(CACHE_DIR, { recursive: true });
      require('fs').writeFileSync(this.getCachePath(hash), JSON.stringify(result, null, 2));
    } catch { /* cache write is best-effort */ }
  }
}
