/**
 * Public surface of the API client: Orval-generated React Query hooks + models,
 * plus configureApiClient (sets the base URL) and the ApiError type.
 *
 * Regenerate from the backend spec with `pnpm generate:api` (see repo root).
 */
export * from './generated/scrai';
export * from './generated/model';
export { configureApiClient, type ApiError, type ConfigureApiClientOptions } from './mutator';
