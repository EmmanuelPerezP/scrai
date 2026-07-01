import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Patient, Sex } from '../../patients/patient.entity';

const MOCK_PATIENTS: Partial<Patient>[] = [
  {
    mrn: 'MRN-001',
    firstName: 'Eleanor',
    lastName: 'Whitfield',
    dateOfBirth: '1948-03-22',
    sex: Sex.Female,
    address: '142 Birchwood Ln, Asheville, NC',
    primaryConditions: 'Congestive heart failure, Hypertension',
  },
  {
    mrn: 'MRN-002',
    firstName: 'Marcus',
    lastName: 'Delgado',
    dateOfBirth: '1956-11-09',
    sex: Sex.Male,
    address: '88 Sequoia Ct, Portland, OR',
    primaryConditions: 'Type 2 Diabetes, COPD',
  },
  {
    mrn: 'MRN-003',
    firstName: 'Aiko',
    lastName: 'Tanaka',
    dateOfBirth: '1962-07-30',
    sex: Sex.Female,
    address: '5 Lakeshore Dr, Madison, WI',
    primaryConditions: 'Post-operative knee replacement recovery',
  },
];

/**
 * Idempotent seed: inserts the mock patients only when the table is empty,
 * so it is safe to run on every boot.
 */
export async function runSeed(dataSource: DataSource): Promise<void> {
  const logger = new Logger('Seed');
  const repo = dataSource.getRepository(Patient);
  const existing = await repo.count();
  if (existing > 0) {
    logger.log(`patients already present (${existing}); skipping seed`);
    return;
  }
  await repo.save(MOCK_PATIENTS.map((p) => repo.create(p)));
  logger.log(`seeded ${MOCK_PATIENTS.length} mock patients`);
}
