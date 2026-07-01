/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreatePatientDto = {
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: CreatePatientDto.sex;
  address?: string;
  primaryConditions?: string;
};
export namespace CreatePatientDto {
  export enum sex {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
    UNKNOWN = 'unknown',
  }
}

