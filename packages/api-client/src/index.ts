/**
 * Public surface of the generated API client.
 *
 * The contents of ./generated are produced from the backend OpenAPI spec by
 * `pnpm --filter @scrai/api-client generate` (see package.json). Run
 * `pnpm generate:api` from the repo root to refresh the spec and regenerate.
 */
export * from './generated';

import { OpenAPI } from './generated';

/** The backend mounts every route under this global prefix (see main.ts). */
const API_PREFIX = '/api';

export interface ConfigureApiClientOptions {
  /** Origin of the backend, e.g. http://localhost:4000 (the `/api` prefix is added for you). */
  baseUrl: string;
  /** Optional bearer token (string or async resolver) for future auth. */
  token?: string | (() => Promise<string>);
}

/**
 * Point the generated client at a backend instance.
 *
 * The OpenAPI spec paths are emitted without the global prefix (Nest applies
 * `setGlobalPrefix('api')` at the HTTP layer, after the document is built), so
 * we append it to the base here. Pass only the origin.
 */
export function configureApiClient(options: ConfigureApiClientOptions): void {
  OpenAPI.BASE = options.baseUrl.replace(/\/$/, '') + API_PREFIX;
  if (options.token !== undefined) {
    OpenAPI.TOKEN = options.token;
  }
}
