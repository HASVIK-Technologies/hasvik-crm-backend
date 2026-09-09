import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsEnum,
} from 'class-validator';


import { NoteEntityType } from '../../mongo/enums';

export class CreateNoteDto {
  @ApiProperty({
    example: 'BUSINESS',
    enum: NoteEntityType,
    description: 'Type of entity to which the note belongs',
  })
  @IsEnum(NoteEntityType)
  entityType!: NoteEntityType;

  @ApiProperty({
    example: '665c12345678901234567890',
    description: 'ID of the entity to which the note belongs',
  })
  @IsMongoId()
  entityId!: string;

  @ApiProperty({
    example: 'Customer requested a quotation for 50 chairs.',
    description: 'Note content',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;
}