import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OSS from 'ali-oss';
import { randomUUID } from 'crypto';

@Injectable()
export class OssService {
  private client: OSS;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.client = new OSS({
      region: this.config.getOrThrow<string>('OSS_REGION'),
      accessKeyId: this.config.getOrThrow<string>('OSS_ACCESS_KEY_ID'),
      accessKeySecret: this.config.getOrThrow<string>('OSS_ACCESS_KEY_SECRET'),
    });
    this.bucket = this.config.getOrThrow<string>('OSS_BUCKET');
  }

  async upload(buffer: Buffer, ext = 'jpg'): Promise<string> {
    const key = `clothes/${randomUUID()}.${ext}`;
    const result = await this.client.put(key, buffer, {
      bucket: this.bucket,
    });
    return result.url;
  }

  async uploadFromBase64(base64: string, ext = 'jpg'): Promise<string> {
    const buffer = Buffer.from(base64, 'base64');
    return this.upload(buffer, ext);
  }
}
