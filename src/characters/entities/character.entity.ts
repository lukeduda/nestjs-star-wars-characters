import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Episodes } from '../types/episodes';
import { Planets } from '../types/planets';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Character extends Document {
  @ApiProperty({ description: 'Id', readOnly: true })
  _id: string;

  @ApiProperty({ description: 'Version', readOnly: true })
  __version: number;

  @ApiProperty({ description: 'Name of a character' })
  @Prop()
  name: string;

  @ApiProperty({
    description: 'Episodes where a character played',
    enum: Episodes,
    isArray: true,
  })
  @Prop([
    {
      type: String,
      required: true,
      enum: Episodes,
    },
  ])
  episodes: Episodes[];

  @ApiProperty({ description: 'The motherland of a character', enum: Planets })
  @Prop({
    type: String,
    enum: Planets,
  })
  planet?: Planets;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);
