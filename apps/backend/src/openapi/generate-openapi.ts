import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { AppModule } from '../app.module';
import { buildOpenApiDocument } from '../swagger';

/**
 * Boots the Nest app (without listening on a port) just far enough to build
 * the OpenAPI document, then writes it to disk. The api-client package
 * consumes this file to generate a typed client.
 *
 * Run via `pnpm --filter @scrai/backend generate:openapi`. A reachable
 * Postgres is required (TypeOrmModule connects during init); both the local
 * docker-compose stack and the CI `postgres` service satisfy that. Seeding is
 * skipped because we never call listen().
 */
async function generate() {
  // Don't seed during generation.
  process.env.DATABASE_RUN_SEED = 'false';

  const app = await NestFactory.create(AppModule, { logger: false });
  const document = buildOpenApiDocument(app);

  const outPath = resolve(__dirname, '../../../../packages/api-client/openapi.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(document, null, 2));

  await app.close();
  // eslint-disable-next-line no-console
  console.log(`✅ wrote OpenAPI spec to ${outPath}`);
}

generate()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
