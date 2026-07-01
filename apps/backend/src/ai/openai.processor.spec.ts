import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';
import { OpenAiProcessor } from './openai.processor';

/** Minimal ConfigService stub returning the `ai` config slice. */
function makeConfig(apiKey?: string): ConfigService<AppConfig, true> {
  const ai: AppConfig['ai'] = {
    provider: 'openai',
    openaiApiKey: apiKey,
    transcribeModel: 'whisper-1',
    summaryModel: 'gpt-4o-mini',
  };
  return { get: () => ai } as unknown as ConfigService<AppConfig, true>;
}

describe('OpenAiProcessor', () => {
  it('rejects empty audio before calling the API', async () => {
    const processor = new OpenAiProcessor(makeConfig('sk-test'));
    await expect(processor.transcribe(Buffer.alloc(0), 'empty.mp3')).rejects.toThrow(
      /empty audio/i,
    );
  });

  it('rejects empty note text before calling the API', async () => {
    const processor = new OpenAiProcessor(makeConfig('sk-test'));
    await expect(processor.summarize('   ')).rejects.toThrow(/empty note/i);
  });

  it('throws a helpful error when no API key is configured', async () => {
    const processor = new OpenAiProcessor(makeConfig(undefined));
    await expect(processor.summarize('Patient reports a cough.')).rejects.toThrow(
      /OPENAI_API_KEY/,
    );
  });

  it('transcribes audio and returns the trimmed text', async () => {
    const processor = new OpenAiProcessor(makeConfig('sk-test'));
    const create = jest.fn().mockResolvedValue('  hello world  ');
    // Inject a fake OpenAI client.
    (processor as unknown as { _client: unknown })._client = {
      audio: { transcriptions: { create } },
    };
    const result = await processor.transcribe(Buffer.from('audio-bytes'), 'visit.mp3');
    expect(result.text).toBe('hello world');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'whisper-1', response_format: 'text' }),
    );
  });

  it('summarizes text using the configured chat model', async () => {
    const processor = new OpenAiProcessor(makeConfig('sk-test'));
    const create = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'S (Subjective): cough\nO/A/P...' } }],
    });
    (processor as unknown as { _client: unknown })._client = {
      chat: { completions: { create } },
    };
    const result = await processor.summarize('Patient reports a cough.');
    expect(result.text).toContain('S (Subjective)');
    const args = create.mock.calls[0][0];
    expect(args.model).toBe('gpt-4o-mini');
    expect(args.messages[0].role).toBe('system');
    expect(args.messages[1].content).toBe('Patient reports a cough.');
  });
});
