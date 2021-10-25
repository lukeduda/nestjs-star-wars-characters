import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Character } from './entities/character.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

@Injectable()
export class CharactersService {
  constructor(
    @InjectModel(Character.name)
    private characterModel: Model<Character>,
  ) {}

  async findAll(paginationQueryDto: PaginationQueryDto) {
    const { limit, offset } = paginationQueryDto;
    return this.characterModel.find().skip(offset).limit(limit).exec();
  }

  async findOne(id: string) {
    const character = await this.characterModel.findOne({ _id: id }).exec();

    if (!character) {
      throw new NotFoundException(`Character #${id} not found`);
    }
    return character;
  }

  async create(createCharacterDto: CreateCharacterDto) {
    const character = new this.characterModel(createCharacterDto);
    return await character.save();
  }

  async update(id: string, updateCharacterDto: UpdateCharacterDto) {
    const existingCharacter = await this.characterModel
      .findOneAndUpdate(
        { _id: id },
        { $set: updateCharacterDto },
        { new: true },
      )
      .exec();

    if (!existingCharacter) {
      throw new NotFoundException(`Character #${id} not found`);
    }
    return existingCharacter;
  }

  async remove(id: string) {
    const character = await this.findOne(id);
    if (!character) {
      throw new NotFoundException(`Character #${id} not found`);
    }
    return character.remove();
  }
}
