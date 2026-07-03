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
 * Request a presigned PUT URL so the browser can upload an audio file directly
 * to S3 (the bytes never stream through the API).
 */
export class CreateAudioUploadUrlDto {
  @ApiProperty({ example: 'visit.m4a', description: 'Original filename (used to build the object key)' })
  @IsString()
  @MinLength(1)
  filename: string;

  @ApiProperty({ example: 'audio/mp4', description: 'MIME type; the PUT must send this same Content-Type' })
  @IsString()
  @MinLength(1)
  contentType: string;
}

/** Presigned upload target returned to the browser. */
export class AudioUploadUrlDto {
  @ApiProperty({ description: 'S3 object key to pass back when creating the note' })
  key: string;

  @ApiProperty({ description: 'Presigned PUT URL the browser uploads the file to' })
  url: string;
}

/**
 * Create a note from an audio file that was already uploaded to S3 via a
 * presigned PUT. References the object by key rather than carrying the bytes.
 */
export class CreateAudioNoteDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'S3 object key returned from /notes/audio/upload-url' })
  @IsString()
  @MinLength(1)
  audioKey: string;

  @ApiProperty({ example: 'visit.m4a', description: 'Original filename, stored for display' })
  @IsString()
  @MinLength(1)
  audioFilename: string;

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
