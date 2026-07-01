import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';
import { AI_PROCESSOR } from './ai.types';
import { OpenAiProcessor } from './openai.processor';
import { StubProcessor } from './stub.processor';

@Module({
  providers: [
    StubProcessor,
    OpenAiProcessor,
    {
      provide: AI_PROCESSOR,
      inject: [ConfigService, StubProcessor, OpenAiProcessor],
      useFactory: (
        config: ConfigService<AppConfig, true>,
        stub: StubProcessor,
        openai: OpenAiProcessor,
      ) => {
        const provider = config.get('ai', { infer: true }).provider;
        return provider === 'openai' ? openai : stub;
      },
    },
  ],
  exports: [AI_PROCESSOR],
})
export class AiModule {}
