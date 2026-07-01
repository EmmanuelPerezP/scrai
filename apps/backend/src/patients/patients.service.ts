import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePatientDto } from './dto/patient.dto';
import { Patient } from './patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patients: Repository<Patient>,
  ) {}

  findAll(): Promise<Patient[]> {
    return this.patients.find({ order: { lastName: 'ASC', firstName: 'ASC' } });
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patients.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient ${id} not found`);
    }
    return patient;
  }

  create(dto: CreatePatientDto): Promise<Patient> {
    const patient = this.patients.create(dto);
    return this.patients.save(patient);
  }
}
