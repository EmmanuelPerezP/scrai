import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Redirect } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  AudioUploadUrlDto,
  CreateAudioNoteDto,
  CreateAudioUploadUrlDto,
  CreateTextNoteDto,
} from './dto/create-note.dto';
import { NoteDetailDto, NoteListItemDto } from './dto/note-response.dto';
import { NotesService } from './notes.service';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ operationId: 'listNotes' })
  @ApiOkResponse({ type: NoteListItemDto, isArray: true })
  findAll(): Promise<NoteListItemDto[]> {
    return this.notesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getNote' })
  @ApiOkResponse({ type: NoteDetailDto })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<NoteDetailDto> {
    return this.notesService.findOne(id);
  }

  // Excluded from the OpenAPI/typed client: this 302-redirects to a signed S3
  // URL and is consumed directly as an <audio> src, not as a JSON resource.
  @Get(':id/audio')
  @ApiExcludeEndpoint()
  @Redirect()
  async streamAudio(@Param('id', new ParseUUIDPipe()) id: string) {
    const url = await this.notesService.getAudioUrl(id);
    return { url, statusCode: 302 };
  }

  @Post('text')
  @ApiOperation({ operationId: 'createTextNote' })
  @ApiCreatedResponse({ type: NoteDetailDto })
  createFromText(@Body() dto: CreateTextNoteDto): Promise<NoteDetailDto> {
    return this.notesService.createFromText(dto);
  }

  @Post('audio/upload-url')
  @ApiOperation({
    operationId: 'createAudioUploadUrl',
    summary: 'Get a presigned PUT URL for uploading an audio file directly to S3',
  })
  @ApiCreatedResponse({ type: AudioUploadUrlDto })
  createAudioUploadUrl(@Body() dto: CreateAudioUploadUrlDto): Promise<AudioUploadUrlDto> {
    return this.notesService.createAudioUploadUrl(dto);
  }

  @Post('audio')
  @ApiOperation({ operationId: 'createAudioNote' })
  @ApiCreatedResponse({ type: NoteDetailDto })
  createFromAudio(@Body() dto: CreateAudioNoteDto): Promise<NoteDetailDto> {
    return this.notesService.createFromAudio(dto);
  }
}
