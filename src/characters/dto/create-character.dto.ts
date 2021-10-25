import {
  ArrayNotEmpty,
  ArrayUnique,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Episodes } from '../types/episodes';
import { Planets } from '../types/planets';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCharacterDto {
  @ApiProperty({ description: 'Name of a character' })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Episodes where a character played',
    enum: Episodes,
    isArray: true,
  })
  @ArrayNotEmpty()
  @IsEnum(Episodes, { each: true })
  @ArrayUnique()
  readonly episodes: string[];

  @ApiProperty({ description: 'The motherland of a character', enum: Planets })
  @IsString()
  @IsOptional()
  @IsEnum(Planets)
  readonly planet?: string;
}
