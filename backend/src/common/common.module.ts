import { Global, Module } from '@nestjs/common';
import { OssService } from './services/oss.service';

@Global()
@Module({
  providers: [OssService],
  exports: [OssService],
})
export class CommonModule {}
