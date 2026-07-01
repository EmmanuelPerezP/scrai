import { DataSourceOptions } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Note } from '../notes/note.entity';

/**
 * Shared TypeORM options builder so the Nest module and the standalone
 * seed runner use exactly the same connection settings.
 */
export const buildDataSourceOptions = (overrides: Partial<DataSourceOptions> = {}): DataSourceOptions =>
  ({
    type: 'postgres',
    url: process.env.DATABASE_URL ?? 'postgres://scrai:scrai@localhost:5432/scrai',
    entities: [Patient, Note],
    synchronize: ['1', 'true', 'yes', 'on'].includes(
      (process.env.DATABASE_SYNCHRONIZE ?? 'true').toLowerCase(),
    ),
    logging: false,
    ...overrides,
  }) as DataSourceOptions;
