import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../common/db/database.module';
import { scenes } from '../common/db/schema';

@Injectable()
export class ScenesService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  async findAll() {
    const result = await this.db.select().from(scenes);
    return { scenes: result };
  }
}
