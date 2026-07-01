/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTextNoteDto } from '../models/CreateTextNoteDto';
import type { NoteDetailDto } from '../models/NoteDetailDto';
import type { NoteListItemDto } from '../models/NoteListItemDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotesService {
  /**
   * @returns NoteListItemDto
   * @throws ApiError
   */
  public static listNotes(): CancelablePromise<Array<NoteListItemDto>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/notes',
    });
  }
  /**
   * @returns NoteDetailDto
   * @throws ApiError
   */
  public static getNote({
    id,
  }: {
    id: string,
  }): CancelablePromise<NoteDetailDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/notes/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns NoteDetailDto
   * @throws ApiError
   */
  public static createTextNote({
    requestBody,
  }: {
    requestBody: CreateTextNoteDto,
  }): CancelablePromise<NoteDetailDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/notes/text',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @returns NoteDetailDto
   * @throws ApiError
   */
  public static createAudioNote({
    formData,
  }: {
    formData: {
      patientId: string;
      title?: string;
      summarize?: boolean;
      file: Blob;
    },
  }): CancelablePromise<NoteDetailDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/notes/audio',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
}
