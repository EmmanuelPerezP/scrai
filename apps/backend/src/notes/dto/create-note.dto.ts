import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

const toBool = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
  return false;
};

/**
 * Create a note from typed free text. (Audio uploads use the multipart
 * endpoint instead — see NotesController.createFromAudio.)
 */
export class CreateTextNoteDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({ example: 'Follow-up visit' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Patient reports mild headache for two days...' })
  @IsString()
  @MinLength(1)
  text: string;

  @ApiPropertyOptional({
    default: true,
    description: 'Generate an AI SOAP summary in addition to storing the raw text',
  })
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  summarize?: boolean = true;
}

/**
 * Multipart form fields that accompany an audio upload.
 * (The file itself is handled by the file interceptor.)
 */
export class CreateAudioNoteDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({ example: 'Home visit recording' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    default: true,
    description: 'Generate an AI SOAP summary from the transcription',
  })
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  summarize?: boolean = true;
}
