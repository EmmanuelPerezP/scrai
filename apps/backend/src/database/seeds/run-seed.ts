import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from '../data-source';
import { runSeed } from './seed';

/**
 * Standalone seed runner: `pnpm --filter @scrai/backend seed`.
 * Useful when the app runs with DATABASE_RUN_SEED=false.
 */
async function main() {
  const dataSource = new DataSource(buildDataSourceOptions({ synchronize: true } as never));
  await dataSource.initialize();
  try {
    await runSeed(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
