import { noteAudioUrl } from './api';

describe('noteAudioUrl', () => {
  const original = process.env.NEXT_PUBLIC_API_BASE_URL;
  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = original;
  });

  it('prefixes the configured API base', () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:4000';
    expect(noteAudioUrl('abc-123')).toBe('http://localhost:4000/api/notes/abc-123/audio');
  });

  it('is same-origin when the base is empty (prod behind the ALB)', () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = '';
    expect(noteAudioUrl('abc-123')).toBe('/api/notes/abc-123/audio');
  });
});
