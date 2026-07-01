/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NoteDetailDto = {
  id: string;
  patientId: string;
  source: NoteDetailDto.source;
  status: NoteDetailDto.status;
  /**
   * Optional clinician-provided title
   */
  title?: string | null;
  /**
   * Raw input: typed text, or the transcription produced from audio
   */
  rawText?: string | null;
  /**
   * AI-structured output (e.g. SOAP summary) derived from the raw text
   */
  processedText?: string | null;
  /**
   * S3 object key for the uploaded audio file
   */
  audioKey?: string | null;
  /**
   * Original uploaded audio filename
   */
  audioFilename?: string | null;
  /**
   * Error detail if processing failed
   */
  error?: string | null;
  createdAt: string;
  updatedAt: string;
  /**
   * Temporary signed URL to stream the audio file
   */
  audioUrl?: string | null;
};
export namespace NoteDetailDto {
  export enum source {
    TEXT = 'text',
    AUDIO = 'audio',
  }
  export enum status {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
  }
}

