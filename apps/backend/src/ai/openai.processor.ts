import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI, { toFile } from 'openai';
import { AppConfig } from '../config/configuration';
import { AiProcessor, SummaryResult, TranscriptionResult } from './ai.types';

/**
 * Clinical documentation prompt for the SOAP summary step. It is deliberately
 * strict about not inventing clinical facts — the output is derived only from
 * what the clinician actually said/typed.
 */
const SOAP_SYSTEM_PROMPT = [
  'You are a clinical scribe assistant for a home-healthcare compliance tool.',
  'Rewrite the clinician note below as a concise, well-structured SOAP note with',
  'exactly these four sections, each on its own line and clearly labelled:',
  '',
  'S (Subjective): what the patient reports — symptoms, history, concerns.',
  'O (Objective): measurable/observed findings — vitals, exam, test results.',
  'A (Assessment): the clinical impression or diagnosis.',
  'P (Plan): next steps — treatment, medication, follow-up.',
  '',
  'Rules:',
  '- Use ONLY information present in the note. Never invent vitals, diagnoses,',
  "  medications, or findings. If a section has no supporting information, write",
  '  "Not documented." for that section.',
  '- Be concise and factual. Do not add commentary, disclaimers, or preamble.',
  '- Preserve clinically significant details and any explicit numbers/dosages.',
].join('\n');

/**
 * OpenAI-backed processor: Whisper for audio transcription and a chat model
 * (default gpt-4o-mini) for the SOAP summary. Selected via AI_PROVIDER=openai
 * with a valid OPENAI_API_KEY; otherwise the StubProcessor is used.
 */
@Injectable()
export class OpenAiProcessor implements AiProcessor {
  private readonly logger = new Logger(OpenAiProcessor.name);
  private _client?: OpenAI;
  private readonly transcribeModel: string;
  private readonly summaryModel: string;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    const ai = this.config.get('ai', { infer: true });
    this.transcribeModel = ai.transcribeModel;
    this.summaryModel = ai.summaryModel;
  }

  /**
   * Lazily construct the SDK client. Doing this on first use (rather than in the
   * constructor) means this provider can be instantiated by the DI container
   * even when no API key is set — important because Nest eagerly creates all
   * providers, including this one, when AI_PROVIDER=stub.
   */
  private get client(): OpenAI {
    if (!this._client) {
      const apiKey = this.config.get('ai', { infer: true }).openaiApiKey;
      if (!apiKey) {
        throw new Error(
          'OPENAI_API_KEY is not set. Set AI_PROVIDER=openai with a valid key, or use the stub provider.',
        );
      }
      this._client = new OpenAI({
        apiKey,
        // Network calls can be slow/flaky; give them room and let the SDK retry.
        timeout: 60_000,
        maxRetries: 2,
      });
    }
    return this._client;
  }

  async transcribe(audio: Buffer, filename: string): Promise<TranscriptionResult> {
    if (audio.length === 0) {
      throw new Error('Cannot transcribe an empty audio file');
    }
    this.logger.log(`transcribing ${filename} (${audio.length} bytes) via ${this.transcribeModel}`);
    const file = await toFile(audio, filename);
    const result: unknown = await this.client.audio.transcriptions.create({
      file,
      model: this.transcribeModel,
      response_format: 'text',
    });
    // With response_format: 'text' the SDK returns the raw string; guard both shapes.
    const text = (
      typeof result === 'string' ? result : (result as { text?: string }).text ?? ''
    ).trim();
    if (!text) {
      throw new Error('Transcription returned no text (audio may be silent or unsupported)');
    }
    return { text };
  }

  async summarize(rawText: string): Promise<SummaryResult> {
    const input = rawText.trim();
    if (!input) {
      throw new Error('Cannot summarize an empty note');
    }
    this.logger.log(`summarizing note via ${this.summaryModel}`);
    const completion = await this.client.chat.completions.create({
      model: this.summaryModel,
      // Low temperature keeps the SOAP output stable and faithful to the input.
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: 'system', content: SOAP_SYSTEM_PROMPT },
        { role: 'user', content: input },
      ],
    });
    const text = completion.choices[0]?.message?.content?.trim() ?? '';
    if (!text) {
      throw new Error('Summary model returned an empty response');
    }
    return { text };
  }
}
