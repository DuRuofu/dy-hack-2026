import { Global, Module } from '@nestjs/common';
import { LocalDbService } from './services/local-db.service';

@Global()
@Module({
  providers: [LocalDbService],
  exports: [LocalDbService],
})
export class CommonModule {}
