/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateTextNoteDto = {
  patientId: string;
  title?: string;
  text: string;
  /**
   * Generate an AI SOAP summary in addition to storing the raw text
   */
  summarize?: boolean;
};

