import { NotFoundException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Sex } from './patient.entity';

describe('PatientsService', () => {
  function setup(seed: any[] = []) {
    const repo = {
      find: jest.fn(async () => seed),
      findOne: jest.fn(async ({ where: { id } }: any) => seed.find((p) => p.id === id) ?? null),
      create: jest.fn((dto: any) => ({ ...dto })),
      save: jest.fn(async (p: any) => ({ id: 'pat-new', ...p })),
    };
    return { service: new PatientsService(repo as any), repo };
  }

  it('lists patients', async () => {
    const { service, repo } = setup([{ id: 'a' }, { id: 'b' }]);
    const all = await service.findAll();
    expect(all).toHaveLength(2);
    expect(repo.find).toHaveBeenCalled();
  });

  it('returns a patient by id', async () => {
    const { service } = setup([{ id: 'a', firstName: 'Ann' }]);
    await expect(service.findOne('a')).resolves.toMatchObject({ firstName: 'Ann' });
  });

  it('404s for an unknown id', async () => {
    const { service } = setup([]);
    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a patient from a DTO', async () => {
    const { service, repo } = setup();
    const dto = {
      mrn: 'MRN-9',
      firstName: 'Sam',
      lastName: 'Lee',
      dateOfBirth: '1970-01-01',
      sex: Sex.Other,
    };
    const created = await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(created).toMatchObject({ mrn: 'MRN-9', id: 'pat-new' });
  });
});
