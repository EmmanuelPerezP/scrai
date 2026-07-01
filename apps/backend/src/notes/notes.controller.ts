import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAudioNoteDto, CreateTextNoteDto } from './dto/create-note.dto';
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

  @Post('text')
  @ApiOperation({ operationId: 'createTextNote' })
  @ApiCreatedResponse({ type: NoteDetailDto })
  createFromText(@Body() dto: CreateTextNoteDto): Promise<NoteDetailDto> {
    return this.notesService.createFromText(dto);
  }

  @Post('audio')
  @ApiOperation({ operationId: 'createAudioNote' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['patientId', 'file'],
      properties: {
        patientId: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        summarize: { type: 'boolean', default: true },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiCreatedResponse({ type: NoteDetailDto })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB, matches Whisper's limit
    }),
  )
  createFromAudio(
    @Body() dto: CreateAudioNoteDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<NoteDetailDto> {
    if (!file) {
      throw new BadRequestException('An audio "file" is required');
    }
    return this.notesService.createFromAudio(dto, file);
  }
}
