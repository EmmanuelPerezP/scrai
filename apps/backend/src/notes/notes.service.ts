import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AI_PROCESSOR, AiProcessor } from '../ai/ai.types';
import { PatientsService } from '../patients/patients.service';
import { StorageService } from '../storage/storage.service';
import { CreateAudioNoteDto, CreateTextNoteDto } from './dto/create-note.dto';
import { NoteDetailDto, NoteListItemDto } from './dto/note-response.dto';
import { Note, NoteSource, NoteStatus } from './note.entity';

type UploadedAudio = { buffer: Buffer; originalname: string; mimetype: string };

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    @InjectRepository(Note)
    private readonly notes: Repository<Note>,
    private readonly patients: PatientsService,
    private readonly storage: StorageService,
    @Inject(AI_PROCESSOR) private readonly ai: AiProcessor,
  ) {}

  async findAll(): Promise<NoteListItemDto[]> {
    const notes = await this.notes.find({
      relations: { patient: true },
      order: { createdAt: 'DESC' },
    });
    return notes.map((note) => this.toListItem(note));
  }

  async findOne(id: string): Promise<NoteDetailDto> {
    const note = await this.notes.findOne({ where: { id }, relations: { patient: true } });
    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }
    const audioUrl = note.audioKey ? await this.storage.getSignedUrl(note.audioKey) : null;
    return { ...note, audioUrl };
  }

  /** Create a note from typed text and (optionally) generate a SOAP summary. */
  async createFromText(dto: CreateTextNoteDto): Promise<NoteDetailDto> {
    await this.patients.findOne(dto.patientId); // 404s if patient is unknown

    let note = await this.notes.save(
      this.notes.create({
        patientId: dto.patientId,
        title: dto.title ?? null,
        source: NoteSource.Text,
        status: NoteStatus.Processing,
        rawText: dto.text,
      }),
    );

    note = await this.runSummary(note, dto.summarize ?? true);
    return this.findOne(note.id);
  }

  /** Create a note from an uploaded audio file: store it, transcribe, summarize. */
  async createFromAudio(dto: CreateAudioNoteDto, file: UploadedAudio): Promise<NoteDetailDto> {
    await this.patients.findOne(dto.patientId);

    const audioKey = await this.storage.uploadAudio(file);

    let note = await this.notes.save(
      this.notes.create({
        patientId: dto.patientId,
        title: dto.title ?? null,
        source: NoteSource.Audio,
        status: NoteStatus.Processing,
        audioKey,
        audioFilename: file.originalname,
      }),
    );

    try {
      const transcription = await this.ai.transcribe(file.buffer, file.originalname);
      note.rawText = transcription.text;
      note = await this.notes.save(note);
      note = await this.runSummary(note, dto.summarize ?? true);
    } catch (err) {
      note.status = NoteStatus.Failed;
      note.error = err instanceof Error ? err.message : String(err);
      this.logger.error(`audio processing failed for note ${note.id}: ${note.error}`);
      await this.notes.save(note);
    }

    return this.findOne(note.id);
  }

  /** Run the AI summary step (or just mark completed if not requested). */
  private async runSummary(note: Note, summarize: boolean): Promise<Note> {
    try {
      if (summarize && note.rawText) {
        const summary = await this.ai.summarize(note.rawText);
        note.processedText = summary.text;
      }
      note.status = NoteStatus.Completed;
      note.error = null;
    } catch (err) {
      note.status = NoteStatus.Failed;
      note.error = err instanceof Error ? err.message : String(err);
      this.logger.error(`summary failed for note ${note.id}: ${note.error}`);
    }
    return this.notes.save(note);
  }

  private toListItem(note: Note): NoteListItemDto {
    const text = note.processedText || note.rawText || '';
    const preview = text.replace(/\s+/g, ' ').trim().slice(0, 160);
    const { patient, ...rest } = note;
    return { ...rest, patient, preview };
  }
}
