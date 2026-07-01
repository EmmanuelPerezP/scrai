/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Patient = {
  id: string;
  /**
   * Medical record number (mock)
   */
  mrn: string;
  firstName: string;
  lastName: string;
  /**
   * Date of birth (YYYY-MM-DD)
   */
  dateOfBirth: string;
  sex: Patient.sex;
  address?: string | null;
  primaryConditions?: string | null;
  createdAt: string;
  updatedAt: string;
};
export namespace Patient {
  export enum sex {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
    UNKNOWN = 'unknown',
  }
}

