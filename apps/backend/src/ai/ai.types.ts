/**
 * Provider-agnostic contract for AI note processing.
 *
 * The concrete implementation (stub today, OpenAI/Whisper later) is selected
 * via the AI_PROVIDER env var. Controllers/services depend only on this token,
 * so swapping providers never touches business logic.
 */
export const AI_PROCESSOR = Symbol('AI_PROCESSOR');

export interface TranscriptionResult {
  text: string;
}

export interface SummaryResult {
  /** Structured/cleaned clinical note (e.g. SOAP format). */
  text: string;
}

export interface AiProcessor {
  /** Convert an audio buffer into text. */
  transcribe(audio: Buffer, filename: string): Promise<TranscriptionResult>;

  /** Turn free/raw clinical text into a structured SOAP-style summary. */
  summarize(rawText: string): Promise<SummaryResult>;
}
