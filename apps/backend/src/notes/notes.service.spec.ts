import { NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NoteSource, NoteStatus } from './note.entity';

/**
 * Unit tests for the core note flows (text + audio), with the repository,
 * storage, AI processor and patients service mocked. This exercises the
 * transcribe → summarize → persist pipeline and its failure handling.
 */
describe('NotesService', () => {
  const patient = { id: 'pat-1', firstName: 'Jane', lastName: 'Doe' };

  function setup(overrides: { summarizeImpl?: () => Promise<{ text: string }> } = {}) {
    const store: Record<string, any> = {};
    const repo = {
      create: jest.fn((x: any) => ({ ...x })),
      save: jest.fn(async (e: any) => {
        const id = e.id ?? 'note-1';
        store[id] = { ...e, id };
        return store[id];
      }),
      findOne: jest.fn(async ({ where: { id } }: any) => (store[id] ? { ...store[id], patient } : null)),
      find: jest.fn(async () => Object.values(store).map((n) => ({ ...n, patient }))),
    };
    const patients = { findOne: jest.fn(async () => patient) } as any;
    const storage = {
      createPresignedUpload: jest.fn(async () => ({
        key: 'audio/uploaded-key',
        url: 'https://s3.example/put',
      })),
      downloadAudio: jest.fn(async () => Buffer.from('audio-bytes')),
      getSignedUrl: jest.fn(async () => 'https://signed.example/audio'),
    } as any;
    const ai = {
      transcribe: jest.fn(async () => ({ text: 'transcribed speech' })),
      summarize: overrides.summarizeImpl
        ? jest.fn(overrides.summarizeImpl)
        : jest.fn(async () => ({ text: 'SOAP NOTE\nS (Subjective): ok' })),
    } as any;

    const service = new NotesService(repo as any, patients, storage, ai);
    return { service, repo, patients, storage, ai, store };
  }

  it('creates a text note and generates a SOAP summary', async () => {
    const { service, ai, patients } = setup();
    const result = await service.createFromText({
      patientId: 'pat-1',
      title: 'Visit',
      text: 'Patient reports a cough.',
      summarize: true,
    });

    expect(patients.findOne).toHaveBeenCalledWith('pat-1');
    expect(ai.summarize).toHaveBeenCalledWith('Patient reports a cough.');
    expect(result.source).toBe(NoteSource.Text);
    expect(result.status).toBe(NoteStatus.Completed);
    expect(result.rawText).toBe('Patient reports a cough.');
    expect(result.processedText).toContain('SOAP NOTE');
    expect(result.audioUrl).toBeNull();
  });

  it('skips summarization when summarize=false', async () => {
    const { service, ai } = setup();
    const result = await service.createFromText({
      patientId: 'pat-1',
      text: 'Just the raw note.',
      summarize: false,
    });
    expect(ai.summarize).not.toHaveBeenCalled();
    expect(result.processedText).toBeUndefined();
    expect(result.status).toBe(NoteStatus.Completed);
  });

  it('marks the note failed but preserves raw text when summarization throws', async () => {
    const { service } = setup({
      summarizeImpl: async () => {
        throw new Error('rate limit');
      },
    });
    const result = await service.createFromText({
      patientId: 'pat-1',
      text: 'Raw note stays.',
      summarize: true,
    });
    expect(result.status).toBe(NoteStatus.Failed);
    expect(result.error).toContain('rate limit');
    expect(result.rawText).toBe('Raw note stays.'); // not lost
  });

  it('mints a presigned upload URL', async () => {
    const { service, storage } = setup();
    const result = await service.createAudioUploadUrl({
      filename: 'visit.m4a',
      contentType: 'audio/mp4',
    });
    expect(storage.createPresignedUpload).toHaveBeenCalledWith('visit.m4a', 'audio/mp4');
    expect(result).toEqual({ key: 'audio/uploaded-key', url: 'https://s3.example/put' });
  });

  it('creates an audio note: downloads from S3, transcribes, summarizes, signs URL', async () => {
    const { service, storage, ai } = setup();
    const result = await service.createFromAudio({
      patientId: 'pat-1',
      audioKey: 'audio/uploaded-key',
      audioFilename: 'visit.m4a',
      summarize: true,
    });

    expect(storage.downloadAudio).toHaveBeenCalledWith('audio/uploaded-key');
    expect(ai.transcribe).toHaveBeenCalledWith(Buffer.from('audio-bytes'), 'visit.m4a');
    expect(result.source).toBe(NoteSource.Audio);
    expect(result.audioKey).toBe('audio/uploaded-key');
    expect(result.audioFilename).toBe('visit.m4a');
    expect(result.rawText).toBe('transcribed speech');
    expect(result.processedText).toContain('SOAP NOTE');
    expect(result.audioUrl).toBe('https://signed.example/audio');
    expect(result.status).toBe(NoteStatus.Completed);
  });

  it('marks an audio note failed if transcription throws', async () => {
    const { service, ai } = setup();
    ai.transcribe.mockRejectedValueOnce(new Error('bad audio'));
    const result = await service.createFromAudio({
      patientId: 'pat-1',
      audioKey: 'audio/bad-key',
      audioFilename: 'bad.m4a',
      summarize: true,
    });
    expect(result.status).toBe(NoteStatus.Failed);
    expect(result.error).toContain('bad audio');
    expect(ai.summarize).not.toHaveBeenCalled();
  });

  it('404s when the patient does not exist', async () => {
    const { service, patients } = setup();
    patients.findOne.mockRejectedValueOnce(new NotFoundException('nope'));
    await expect(
      service.createFromText({ patientId: 'ghost', text: 'x', summarize: true }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('builds a trimmed preview and sorts notes for the list view', async () => {
    const { service } = setup();
    await service.createFromText({ patientId: 'pat-1', text: 'a'.repeat(300), summarize: false });
    const list = await service.findAll();
    expect(list).toHaveLength(1);
    expect(list[0].preview.length).toBeLessThanOrEqual(160);
    expect(list[0].patient).toBeDefined();
  });

  it('throws NotFoundException when getting a missing note', async () => {
    const { service } = setup();
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
