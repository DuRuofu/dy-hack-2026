import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAiProvider } from './ai.interface';
import { AlibabaBailianProvider } from './alibaba-bailian.provider';

@Global()
@Module({
  providers: [
    {
      provide: IAiProvider,
      useFactory: (config: ConfigService) => {
        const provider = config.get('AI_PROVIDER', 'alibaba_bailian');
        switch (provider) {
          case 'alibaba_bailian':
          default:
            return new AlibabaBailianProvider(config);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [IAiProvider],
})
export class AiModule {}
