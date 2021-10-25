import { Test, TestingModule } from '@nestjs/testing';
import { CharactersService } from './characters.service';
import { Character } from './entities/character.entity';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Episodes } from './types/episodes';
import { Planets } from './types/planets';

class MongoModelMock {
  findOne = jest.fn().mockReturnThis();
  findOneAndUpdate = jest.fn().mockReturnThis();
  find = jest.fn().mockReturnThis();
  skip = jest.fn().mockReturnThis();
  limit = jest.fn().mockReturnThis();
  exec = jest.fn();
  save = jest.fn();
}

describe('CharactersService', () => {
  let service: CharactersService;
  let mongoModelMock: MongoModelMock;

  beforeEach(async () => {
    mongoModelMock = new MongoModelMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersService,
        {
          provide: getModelToken(Character.name),
          useValue: mongoModelMock,
        },
      ],
    }).compile();

    service = module.get<CharactersService>(CharactersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    describe('when there is no return data', () => {
      it('should return empty array', async () => {
        const expectedCharacterList = [];
        mongoModelMock.exec = jest.fn().mockReturnValue(expectedCharacterList);

        const characters = await service.findAll(new PaginationQueryDto());
        expect(characters).toEqual(expectedCharacterList);
      });
    });
    describe('when pagination data is empty', () => {
      it('should return characters list', async () => {
        const expectedCharacterList = [
          { name: 'Test1', episodes: [Episodes.NEWHOPE] },
          {
            name: 'Test2',
            episodes: [Episodes.JEDI, Episodes.EMPIRE],
            planet: Planets.Alderaan,
          },
        ];
        mongoModelMock.exec = jest.fn().mockReturnValue(expectedCharacterList);

        const characters = await service.findAll(new PaginationQueryDto());
        expect(mongoModelMock.find).toHaveBeenCalledTimes(1);
        expect(mongoModelMock.skip).toHaveBeenCalledTimes(1);
        expect(mongoModelMock.skip).toHaveBeenCalledWith(undefined);
        expect(mongoModelMock.limit).toHaveBeenCalledTimes(1);
        expect(mongoModelMock.limit).toHaveBeenCalledWith(undefined);
        expect(mongoModelMock.exec).toHaveBeenCalledTimes(1);
        expect(characters).toEqual(expectedCharacterList);
      });
    });
    describe('when pagination data is defined', () => {
      it('should return limited characters list', async () => {
        const expectedCharacterList = [
          { name: 'Test1', episodes: [Episodes.NEWHOPE] },
          {
            name: 'Test2',
            episodes: [Episodes.JEDI, Episodes.EMPIRE],
            planet: Planets.Alderaan,
          },
        ];
        mongoModelMock.exec = jest.fn().mockReturnValue(expectedCharacterList);

        const characters = await service.findAll({ limit: 10, offset: 0 });
        expect(mongoModelMock.find).toHaveBeenCalledTimes(1);
        expect(mongoModelMock.skip).toHaveBeenCalledTimes(1);
        expect(mongoModelMock.skip).toHaveBeenCalledWith(0);
        expect(mongoModelMock.limit).toHaveBeenCalledTimes(1);
        expect(mongoModelMock.limit).toHaveBeenCalledWith(10);
        expect(mongoModelMock.exec).toHaveBeenCalledTimes(1);
        expect(characters).toEqual(expectedCharacterList);
      });
    });
    describe('when one of the mongodb methods throw an exception', () => {
      it('should pass exception', async () => {
        mongoModelMock.exec = jest.fn().mockRejectedValue(new Error('Test'));

        await expect(service.findAll({ limit: 10, offset: 0 })).rejects.toThrow(
          new Error('Test'),
        );
      });
    });
  });

  describe('findOne', () => {
    describe('when character with ID exists', () => {
      it('should return the character object', async () => {
        const expectedCharacter = {};

        mongoModelMock.exec = jest.fn().mockReturnValue(expectedCharacter);

        const character = await service.findOne('1');
        expect(character).toEqual(expectedCharacter);
        expect(mongoModelMock.findOne).toHaveBeenCalledTimes(1);
        expect(mongoModelMock.findOne).toHaveBeenCalledWith({ _id: '1' });
        expect(mongoModelMock.exec).toHaveBeenCalledTimes(1);
      });
    });
    describe("when character doesn't exists", () => {
      it('should throw not found exception', async () => {
        await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
      });
    });
    describe('when one of the mongodb methods throw an exception', () => {
      it('should pass exception', async () => {
        mongoModelMock.exec = jest.fn().mockRejectedValue(new Error('Test'));

        await expect(service.findAll({ limit: 10, offset: 0 })).rejects.toThrow(
          new Error('Test'),
        );
      });
    });
  });

  describe('create', () => {
    const mongoModelConstructorMock = jest.fn(() => mongoModelMock);
    describe('when a proper character DTO is passed', () => {
      it('should return created character object', async () => {
        // Recompile with different constructor mock
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            CharactersService,
            {
              provide: getModelToken(Character.name),
              useValue: mongoModelConstructorMock,
            },
          ],
        }).compile();

        service = await module.get<CharactersService>(CharactersService);

        const characterToCreate = {
          name: 'Test2',
          episodes: [Episodes.JEDI, Episodes.EMPIRE],
          planet: Planets.Alderaan,
        };

        mongoModelMock.save = jest.fn().mockReturnValue(characterToCreate);

        const character = await service.create(characterToCreate);
        expect(mongoModelConstructorMock).toHaveBeenCalledTimes(1);
        expect(mongoModelConstructorMock).toHaveBeenCalledWith(
          characterToCreate,
        );
        expect(mongoModelMock.save).toHaveBeenCalledTimes(1);
        expect(character).toEqual(characterToCreate);
      });
    });

    describe('when one of the mongodb methods throw an exception', () => {
      it('should pass exception', async () => {
        // Recompile with different constructor mock
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            CharactersService,
            {
              provide: getModelToken(Character.name),
              useValue: mongoModelConstructorMock,
            },
          ],
        }).compile();

        service = await module.get<CharactersService>(CharactersService);

        const characterToCreate = {
          name: 'Test2',
          episodes: [Episodes.JEDI, Episodes.EMPIRE],
          planet: Planets.Alderaan,
        };

        mongoModelMock.save = jest.fn().mockRejectedValue(new Error('Test'));

        await expect(service.create(characterToCreate)).rejects.toThrow(
          new Error('Test'),
        );
      });
    });
  });

  describe('remove', () => {
    describe('when an proper character exists', () => {
      it('should return character object', async () => {
        const characterToDeleteId = '1';
        const characterToDelete = {
          name: 'Test2',
          episodes: [Episodes.JEDI, Episodes.EMPIRE],
          planet: Planets.Alderaan,
          remove: jest.fn().mockReturnThis(),
        };

        mongoModelMock.exec = jest.fn().mockReturnValue(characterToDelete);

        const character = await service.remove(characterToDeleteId);
        expect(characterToDelete.remove).toHaveBeenCalledTimes(1);
        expect(character).toEqual(characterToDelete);
      });
    });

    describe("when a proper character doesn't exist", () => {
      it('should throw not found exception', async () => {
        const characterToDeleteId = '1';
        mongoModelMock.exec = jest.fn().mockReturnValue(undefined);

        await expect(service.remove(characterToDeleteId)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('when one of the mongodb methods throw an exception', () => {
      it('should pass exception', async () => {
        const characterToDeleteId = '1';
        mongoModelMock.exec = jest.fn().mockRejectedValue(new Error('Test'));

        await expect(service.remove(characterToDeleteId)).rejects.toThrow(
          new Error('Test'),
        );
      });
    });
  });
});
