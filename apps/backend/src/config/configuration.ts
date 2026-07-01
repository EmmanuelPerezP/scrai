/**
 * Centralised, typed configuration loaded from environment variables.
 * Keeping this in one place makes it obvious what the service needs to run.
 */
export interface AppConfig {
  env: string;
  port: number;
  corsOrigin: string;
  database: {
    url: string;
    synchronize: boolean;
    runSeed: boolean;
  };
  storage: {
    region: string;
    bucket: string;
    endpoint?: string;
    forcePathStyle: boolean;
  };
  ai: {
    provider: 'stub' | 'openai';
    openaiApiKey?: string;
    transcribeModel: string;
    summaryModel: string;
  };
}

const toBool = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

export default (): AppConfig => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL ?? 'postgres://scrai:scrai@localhost:5432/scrai',
    synchronize: toBool(process.env.DATABASE_SYNCHRONIZE, true),
    runSeed: toBool(process.env.DATABASE_RUN_SEED, true),
  },
  storage: {
    region: process.env.AWS_REGION ?? 'us-east-1',
    bucket: process.env.S3_BUCKET ?? 'scrai-audio',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: toBool(process.env.S3_FORCE_PATH_STYLE, false),
  },
  ai: {
    provider: (process.env.AI_PROVIDER as 'stub' | 'openai') ?? 'stub',
    openaiApiKey: process.env.OPENAI_API_KEY || undefined,
    transcribeModel: process.env.OPENAI_TRANSCRIBE_MODEL ?? 'whisper-1',
    summaryModel: process.env.OPENAI_SUMMARY_MODEL ?? 'gpt-4o-mini',
  },
});
