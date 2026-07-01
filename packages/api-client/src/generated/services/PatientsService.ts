/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePatientDto } from '../models/CreatePatientDto';
import type { Patient } from '../models/Patient';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PatientsService {
  /**
   * @returns Patient
   * @throws ApiError
   */
  public static listPatients(): CancelablePromise<Array<Patient>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/patients',
    });
  }
  /**
   * @returns Patient
   * @throws ApiError
   */
  public static createPatient({
    requestBody,
  }: {
    requestBody: CreatePatientDto,
  }): CancelablePromise<Patient> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/patients',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @returns Patient
   * @throws ApiError
   */
  public static getPatient({
    id,
  }: {
    id: string,
  }): CancelablePromise<Patient> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/patients/{id}',
      path: {
        'id': id,
      },
    });
  }
}
