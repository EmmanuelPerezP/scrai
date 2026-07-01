import { DataSourceOptions } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Note } from '../notes/note.entity';

/**
 * Shared TypeORM options builder so the Nest module and the standalone
 * seed runner use exactly the same connection settings.
 */
const toBool = (v: string | undefined, fallback = false): boolean =>
  v === undefined ? fallback : ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());

export const buildDataSourceOptions = (overrides: Partial<DataSourceOptions> = {}): DataSourceOptions =>
  ({
    type: 'postgres',
    url: process.env.DATABASE_URL ?? 'postgres://scrai:scrai@localhost:5432/scrai',
    entities: [Patient, Note],
    synchronize: toBool(process.env.DATABASE_SYNCHRONIZE, true),
    // Managed Postgres (e.g. AWS RDS) enforces TLS. Enable via DATABASE_SSL=true.
    // rejectUnauthorized:false accepts the provider cert without bundling its CA
    // (traffic is still encrypted) — fine for this project; pin the CA in prod.
    ssl: toBool(process.env.DATABASE_SSL) ? { rejectUnauthorized: false } : false,
    logging: false,
    ...overrides,
  }) as DataSourceOptions;
