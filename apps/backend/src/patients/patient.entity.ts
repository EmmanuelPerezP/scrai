import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Note } from '../notes/note.entity';

export enum Sex {
  Male = 'male',
  Female = 'female',
  Other = 'other',
  Unknown = 'unknown',
}

@Entity({ name: 'patients' })
export class Patient {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'MRN-001', description: 'Medical record number (mock)' })
  @Column({ unique: true })
  mrn: string;

  @ApiProperty({ example: 'Jane' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Column()
  lastName: string;

  @ApiProperty({ example: '1955-04-12', description: 'Date of birth (YYYY-MM-DD)' })
  @Column({ type: 'date' })
  dateOfBirth: string;

  @ApiProperty({ enum: Sex, example: Sex.Female })
  @Column({ type: 'enum', enum: Sex, default: Sex.Unknown })
  sex: Sex;

  @ApiProperty({ type: String, required: false, nullable: true, example: '123 Maple St, Springfield, IL' })
  @Column({ nullable: true, type: 'text' })
  address?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    example: 'Hypertension, Type 2 Diabetes',
  })
  @Column({ nullable: true, type: 'text' })
  primaryConditions?: string | null;

  @OneToMany(() => Note, (note) => note.patient)
  notes: Note[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
