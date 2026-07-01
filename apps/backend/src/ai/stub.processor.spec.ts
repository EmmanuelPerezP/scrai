import { StubProcessor } from './stub.processor';

describe('StubProcessor', () => {
  const processor = new StubProcessor();

  it('produces transcription text referencing the filename', async () => {
    const result = await processor.transcribe(Buffer.from('fake-audio'), 'visit.mp3');
    expect(result.text).toContain('visit.mp3');
  });

  it('produces a SOAP-structured summary including the subjective input', async () => {
    const result = await processor.summarize('Patient reports persistent cough.');
    expect(result.text).toContain('SOAP NOTE');
    expect(result.text).toContain('Patient reports persistent cough.');
    expect(result.text).toMatch(/S \(Subjective\)/);
    expect(result.text).toMatch(/P \(Plan\)/);
  });
});
