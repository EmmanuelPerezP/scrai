import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePatientDto } from './dto/patient.dto';
import { Patient } from './patient.entity';
import { PatientsService } from './patients.service';

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ operationId: 'listPatients' })
  @ApiOkResponse({ type: Patient, isArray: true })
  findAll(): Promise<Patient[]> {
    return this.patientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getPatient' })
  @ApiOkResponse({ type: Patient })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Patient> {
    return this.patientsService.findOne(id);
  }

  @Post()
  @ApiOperation({ operationId: 'createPatient' })
  @ApiCreatedResponse({ type: Patient })
  create(@Body() dto: CreatePatientDto): Promise<Patient> {
    return this.patientsService.create(dto);
  }
}
