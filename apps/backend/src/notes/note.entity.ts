import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../patients/patient.entity';

export enum NoteSource {
  Text = 'text',
  Audio = 'audio',
}

export enum NoteStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

@Entity({ name: 'notes' })
export class Note {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Index()
  @Column({ type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ApiProperty({ enum: NoteSource })
  @Column({ type: 'enum', enum: NoteSource })
  source: NoteSource;

  @ApiProperty({ enum: NoteStatus })
  @Column({ type: 'enum', enum: NoteStatus, default: NoteStatus.Pending })
  status: NoteStatus;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Optional clinician-provided title',
  })
  @Column({ nullable: true, type: 'text' })
  title?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Raw input: typed text, or the transcription produced from audio',
  })
  @Column({ nullable: true, type: 'text' })
  rawText?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'AI-structured output (e.g. SOAP summary) derived from the raw text',
  })
  @Column({ nullable: true, type: 'text' })
  processedText?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'S3 object key for the uploaded audio file',
  })
  @Column({ nullable: true, type: 'text' })
  audioKey?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Original uploaded audio filename',
  })
  @Column({ nullable: true, type: 'text' })
  audioFilename?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Error detail if processing failed',
  })
  @Column({ nullable: true, type: 'text' })
  error?: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
