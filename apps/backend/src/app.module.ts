import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from './ai/ai.module';
import configuration, { AppConfig } from './config/configuration';
import { buildDataSourceOptions } from './database/data-source';
import { HealthController } from './health/health.controller';
import { NotesModule } from './notes/notes.module';
import { PatientsModule } from './patients/patients.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const db = config.get('database', { infer: true });
        return buildDataSourceOptions({
          url: db.url,
          synchronize: db.synchronize,
        } as never);
      },
    }),
    PatientsModule,
    NotesModule,
    StorageModule,
    AiModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
