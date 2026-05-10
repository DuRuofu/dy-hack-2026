import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/db/database.module';
import { CommonModule } from './common/common.module';
import { AiModule } from './common/services/ai/ai.module';
import { ScenesModule } from './scenes/scenes.module';
import { WardrobeModule } from './wardrobe/wardrobe.module';
import { RecognizeModule } from './recognize/recognize.module';
import { OutfitModule } from './outfit/outfit.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CommonModule,
    AiModule,
    ScenesModule,
    WardrobeModule,
    RecognizeModule,
    OutfitModule,
    VideoModule,
  ],
})
export class AppModule {}
