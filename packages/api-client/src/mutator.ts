/**
 * Custom fetch instance used by the Orval-generated React Query hooks.
 * Holds the API base URL (set via configureApiClient) and normalises errors.
 *
 * Orval's fetch client already builds the URL, method, headers, and body
 * (JSON or multipart FormData) — this just prepends the base URL, performs the
 * request, and throws a typed ApiError on non-2xx responses.
 */

// The backend mounts every route under this global prefix (Nest setGlobalPrefix).
const API_PREFIX = '/api';

let baseUrl = API_PREFIX;

export interface ConfigureApiClientOptions {
  /** Origin of the backend, e.g. http://localhost:4000 (the /api prefix is added). */
  baseUrl: string;
}

export function configureApiClient({ baseUrl: origin }: ConfigureApiClientOptions): void {
  baseUrl = origin.replace(/\/$/, '') + API_PREFIX;
}

export interface ApiError extends Error {
  status: number;
  body: unknown;
}

export const customInstance = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(baseUrl + url, options);

  const text = await res.text();
  const parsed = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message =
      typeof parsed === 'object' && parsed && 'message' in parsed
        ? String((parsed as { message: unknown }).message)
        : `Request failed (${res.status})`;
    const err = new Error(message) as ApiError;
    err.status = res.status;
    err.body = parsed;
    throw err;
  }

  return parsed as T;
};

export default customInstance;
