import { Injectable } from '@nestjs/common';
import { LocalDbService } from '../common/services/local-db.service';

@Injectable()
export class ScenesService {
  constructor(private localDb: LocalDbService) {}

  async findAll() {
    const scenes = await this.localDb.findAllScenes();
    return { scenes };
  }
}
