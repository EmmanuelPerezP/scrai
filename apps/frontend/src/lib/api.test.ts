import { noteAudioUrl } from './api';

describe('noteAudioUrl', () => {
  it('points at the backend audio-stream endpoint for the note', () => {
    // No NEXT_PUBLIC_API_BASE_URL set in tests → defaults to localhost:4000.
    expect(noteAudioUrl('abc-123')).toBe('http://localhost:4000/api/notes/abc-123/audio');
  });
});
