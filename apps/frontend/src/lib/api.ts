import { configureApiClient } from '@scrai/api-client';

/**
 * Resolve the backend origin for the current execution context.
 * - In the browser we use the public URL. Set NEXT_PUBLIC_API_BASE_URL='' at
 *   build time to make requests same-origin (the prod ALB routes /api there).
 * - During SSR we use an absolute internal URL (docker service name / ALB DNS),
 *   since relative URLs don't work server-side. This is read at runtime.
 *
 * `?? ` (not `||`) is deliberate: an explicit empty string means "same origin".
 */
export function resolveApiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
  if (typeof window !== 'undefined') {
    return publicUrl;
  }
  return process.env.API_BASE_URL_INTERNAL || publicUrl || 'http://localhost:4000';
}

// Configure the generated client once per bundle evaluation.
configureApiClient({ baseUrl: resolveApiBaseUrl() });

/**
 * Absolute URL for streaming a note's audio. Hits the backend, which
 * 302-redirects to a short-lived signed S3 URL — so the credential is minted
 * on demand and never lives in cached note data. Used directly as an <audio> src.
 */
export function noteAudioUrl(noteId: string): string {
  return `${resolveApiBaseUrl()}/api/notes/${noteId}/audio`;
}

export * from '@scrai/api-client';
