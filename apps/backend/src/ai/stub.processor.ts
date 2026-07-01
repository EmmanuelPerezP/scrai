import { Injectable, Logger } from '@nestjs/common';
import { AiProcessor, SummaryResult, TranscriptionResult } from './ai.types';

/**
 * Deterministic, dependency-free implementation used for local dev and tests.
 * It lets the whole vertical slice (upload -> process -> view) work without
 * any API keys. The real provider is wired in a later step.
 */
@Injectable()
export class StubProcessor implements AiProcessor {
  private readonly logger = new Logger(StubProcessor.name);

  async transcribe(audio: Buffer, filename: string): Promise<TranscriptionResult> {
    this.logger.log(`[stub] transcribing ${filename} (${audio.length} bytes)`);
    return {
      text:
        `[stubbed transcription of "${filename}"]\n` +
        'Patient reports feeling better since the last visit. ' +
        'Continues current medication. No new complaints. ' +
        'Vitals within normal limits.',
    };
  }

  async summarize(rawText: string): Promise<SummaryResult> {
    this.logger.log('[stub] summarizing note into SOAP format');
    const trimmed = rawText.trim();
    return {
      text: [
        'SOAP NOTE (stub-generated)',
        '',
        `S (Subjective): ${trimmed.slice(0, 280) || 'N/A'}`,
        'O (Objective): Vitals stable. No acute distress noted.',
        'A (Assessment): Condition stable; responding to current plan.',
        'P (Plan): Continue current management; follow up as scheduled.',
      ].join('\n'),
    };
  }
}
