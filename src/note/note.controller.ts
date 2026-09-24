import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteFilterDto } from './dto/note-filter.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new note',
    description: 'Creates a note against a business, follow-up, contact, opportunity, or task.',
  })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Referenced entity not found.',
  })
  @Permissions(Permission.NOTE_CREATE)
  async create(@Body() dto: CreateNoteDto, @Req() req: any) {
    const userId = req.user.userId;
    return await this.noteService.create(dto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get notes',
    description: 'Returns notes with optional entity filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notes retrieved successfully.',
  })
  @Permissions(Permission.NOTE_READ)
  async findAll(
    @Query() query: NoteFilterDto,
  ) {
    return await this.noteService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get note by ID',
    description: 'Returns a note using its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Note ID',
    example: '665c12345678901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Note retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found.',
  })
  @Permissions(Permission.NOTE_READ)
  async findById(@Param('id') id: string) {
    return await this.noteService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update note',
    description: 'Updates the content of an existing note.',
  })
  @ApiParam({
    name: 'id',
    description: 'Note ID',
    example: '665c12345678901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found.',
  })
  @Permissions(Permission.NOTE_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
    @Req() req: any
  ) {
    const userId = req.user.userId;
    return await this.noteService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete note',
    description: 'Deletes an existing note.',
  })
  @ApiParam({
    name: 'id',
    description: 'Note ID',
    example: '665c12345678901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Note deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found.',
  })
  @Permissions(Permission.NOTE_DELETE)
  async delete(@Param('id') id: string) {
    return await this.noteService.delete(id);
  }
}