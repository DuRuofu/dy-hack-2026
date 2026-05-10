import { ConfigService } from '@nestjs/config';
export declare class OssService {
    private config;
    private client;
    private bucket;
    constructor(config: ConfigService);
    upload(buffer: Buffer, ext?: string): Promise<string>;
    uploadFromBase64(base64: string, ext?: string): Promise<string>;
}
