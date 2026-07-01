/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Patient } from './Patient';
export type NoteListItemDto = {
  id: string;
  patientId: string;
  source: NoteListItemDto.source;
  status: NoteListItemDto.status;
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
   * First ~160 chars of the best available note text
   */
  preview: string;
  patient: Patient;
};
export namespace NoteListItemDto {
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

