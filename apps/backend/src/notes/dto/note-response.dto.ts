import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Patient } from '../../patients/patient.entity';
import { Note } from '../note.entity';

/** A note in list views — includes a short preview and the patient summary. */
export class NoteListItemDto extends OmitType(Note, ['patient'] as const) {
  @ApiProperty({ type: String, description: 'First ~160 chars of the best available note text' })
  preview: string;

  @ApiProperty({ type: Patient })
  patient: Patient;
}

/** Full note detail, including a signed URL to play back the audio if present. */
export class NoteDetailDto extends Note {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Temporary signed URL to stream the audio file',
  })
  audioUrl?: string | null;
}
