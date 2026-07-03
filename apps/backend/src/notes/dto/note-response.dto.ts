import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Patient } from '../../patients/patient.entity';
import { Note } from '../note.entity';

/** A note in list views — includes a short preview and the patient summary. */
export class NoteListItemDto extends OmitType(Note, ['patient'] as const) {
  @ApiProperty({ type: String, description: 'First ~160 chars of the best available note text' })
  preview: string;

  @ApiProperty({ type: Patient })
  patient: Patient;
}

/**
 * Full note detail — pure, cacheable data. Audio is played via the separate
 * GET /api/notes/:id/audio endpoint (which 302-redirects to a signed S3 URL),
 * so no short-lived credential is embedded in this response.
 */
export class NoteDetailDto extends Note {}
