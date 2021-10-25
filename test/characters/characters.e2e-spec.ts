import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CharactersService } from '../../src/characters/characters.service';
import { Episodes } from '../../src/characters/types/episodes';
import { Planets } from '../../src/characters/types/planets';
import { Error } from 'mongoose';
import { MongoConnectionService } from '../util/mongo-connection.service';

describe('CharactersController (e2e)', () => {
  let app: INestApplication;
  let service: CharactersService;
  let mongoConnection: MongoConnectionService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [MongoConnectionService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    service = moduleFixture.get<CharactersService>(CharactersService);
    mongoConnection = moduleFixture.get<MongoConnectionService>(
      MongoConnectionService,
    );

    await mongoConnection.dropMongoCollection('characters');
  });

  afterAll(async () => {
    await mongoConnection.close();
  });

  describe('/characters (GET)', () => {
    it('should return empty array on no data', async () => {
      await request(app.getHttpServer())
        .get('/characters')
        .expect(200)
        .expect([]);
    });
    it('should return array on existing data', async () => {
      const fixtures = [
        { name: 'Test 1', episodes: [Episodes.JEDI] },
        {
          name: 'Test 2',
          episodes: [Episodes.JEDI, Episodes.NEWHOPE],
          planet: Planets.Alderaan,
        },
      ];
      const firstResult = await service.create(fixtures[0]);
      const secondResult = await service.create(fixtures[1]);

      await request(app.getHttpServer())
        .get('/characters')
        .expect(200)
        .then((res) => {
          expect(res.body[0].name).toEqual(fixtures[0].name);
          expect(res.body[0].episodes).toStrictEqual(fixtures[0].episodes);
          expect(res.body[0].planet).toBeUndefined();
          expect(res.body[0]._id).toEqual(firstResult._id.toString());
          expect(res.body[0].__v).toEqual(firstResult.__v);

          expect(res.body[1].name).toEqual(fixtures[1].name);
          expect(res.body[1].episodes).toStrictEqual(fixtures[1].episodes);
          expect(res.body[1].planet).toEqual(fixtures[1].planet);
          expect(res.body[1]._id).toEqual(secondResult._id.toString());
          expect(res.body[1].__v).toEqual(secondResult.__v);
        });
    });
    it('should return 500 error on any database exception', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValueOnce(new Error('General error'));

      await request(app.getHttpServer())
        .get('/characters')
        .expect(500)
        .expect({ statusCode: 500, message: 'Internal server error' });
    });
  });

  describe('/characters/:id (GET)', () => {
    it('should return 404 status code on missing resource', async () => {
      await request(app.getHttpServer())
        .get('/characters/61766f184ba3c178fe52984d')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Character #61766f184ba3c178fe52984d not found',
          error: 'Not Found',
        });
    });
    it('should return 400 status code on searching by non mongodb id', async () => {
      await request(app.getHttpServer())
        .get('/characters/123')
        .expect(400)
        .then((res) => {
          expect(res.body).toEqual({
            statusCode: 400,
            message: 'Invalid id format',
            error: 'Bad Request',
          });
        });
    });
  });

  describe('/characters (POST)', () => {
    it('should return newly created object', async () => {
      const fixture = { name: 'Test 1', episodes: [Episodes.JEDI] };

      await request(app.getHttpServer())
        .post('/characters')
        .send(fixture)
        .expect(201)
        .then((res) => {
          expect(res.body.name).toEqual(fixture.name);
          expect(res.body.episodes).toStrictEqual(fixture.episodes);
          expect(res.body.planet).toBeUndefined();
          expect(typeof res.body._id).toEqual('string');
          expect(typeof res.body.__v).toEqual('number');
        });
    });

    it('should return newly created object with planet property', async () => {
      const payload = {
        name: 'Test 1',
        episodes: [Episodes.JEDI, Episodes.NEWHOPE],
        planet: Planets.Alderaan,
      };

      await request(app.getHttpServer())
        .post('/characters')
        .send(payload)
        .expect(201)
        .then((res) => {
          expect(res.body.name).toEqual(payload.name);
          expect(res.body.episodes).toStrictEqual(payload.episodes);
          expect(res.body.planet).toEqual(Planets.Alderaan);
          expect(typeof res.body._id).toEqual('string');
          expect(typeof res.body.__v).toEqual('number');
        });
    });

    it('should return 400 status code on invalid name and episodes data payload', async () => {
      const payload = {};

      await request(app.getHttpServer())
        .post('/characters')
        .send(payload)
        .expect(400)
        .then((res) => {
          expect(res.body).toEqual({
            statusCode: 400,
            message: [
              'name should not be empty',
              'name must be a string',
              "All episodes's elements must be unique",
              'each value in episodes must be a valid enum value',
              'episodes should not be empty',
            ],
            error: 'Bad Request',
          });
        });
    });

    it('should return 400 status code on invalid planet data payload', async () => {
      const payload = {
        name: 'Test 1',
        episodes: ['NEWHOPE', 'EMPIRE', 'JEDI'],
        planet: 'Test 1',
      };

      await request(app.getHttpServer())
        .post('/characters')
        .send(payload)
        .expect(400)
        .then((res) => {
          expect(res.body).toEqual({
            statusCode: 400,
            message: ['planet must be a valid enum value'],
            error: 'Bad Request',
          });
        });
    });

    it('should return 400 status code on non unique episodes data', async () => {
      const payload = {
        name: 'Test 1',
        episodes: ['NEWHOPE', 'NEWHOPE'],
        planet: Planets.Alderaan,
      };

      await request(app.getHttpServer())
        .post('/characters')
        .send(payload)
        .expect(400)
        .then((res) => {
          expect(res.body).toEqual({
            statusCode: 400,
            message: ["All episodes's elements must be unique"],
            error: 'Bad Request',
          });
        });
    });
  });

  describe('/characters (PATCH)', () => {
    it('should return newly created object', async () => {
      const fixture = { name: 'Test 1', episodes: [Episodes.JEDI] };
      const patchPayload = {
        name: 'Test 2',
        episodes: [Episodes.NEWHOPE, Episodes.EMPIRE],
        planet: Planets.Alderaan,
      };

      const firstResult = await service.create(fixture);

      await request(app.getHttpServer())
        .patch('/characters/' + firstResult._id)
        .send(patchPayload)
        .expect(200)
        .then((res) => {
          expect(res.body.name).toEqual(patchPayload.name);
          expect(res.body.episodes).toStrictEqual(patchPayload.episodes);
          expect(res.body.planet).toEqual(patchPayload.planet);
          expect(typeof res.body._id).toEqual('string');
          expect(typeof res.body.__v).toEqual('number');
        });
    });

    it('should keep validation of episodes property', async () => {
      const fixture = { name: 'Test 1', episodes: [Episodes.JEDI] };
      const patchPayload = { episodes: [Episodes.JEDI, Episodes.JEDI] };

      const firstResult = await service.create(fixture);

      await request(app.getHttpServer())
        .patch('/characters/' + firstResult._id)
        .send(patchPayload)
        .expect(400)
        .then((res) => {
          expect(res.body).toEqual({
            statusCode: 400,
            message: ["All episodes's elements must be unique"],
            error: 'Bad Request',
          });
        });
    });

    it('should keep validation of name and planet property', async () => {
      const fixture = { name: 'Test 1', episodes: [Episodes.JEDI] };
      const patchPayload = { name: '', planet: 'test' };

      const firstResult = await service.create(fixture);

      await request(app.getHttpServer())
        .patch('/characters/' + firstResult._id)
        .send(patchPayload)
        .expect(400)
        .then((res) => {
          expect(res.body).toEqual({
            statusCode: 400,
            message: [
              'name should not be empty',
              'planet must be a valid enum value',
            ],
            error: 'Bad Request',
          });
        });
    });

    it('should return 404 on patching missing resource', async () => {
      await request(app.getHttpServer())
        .patch('/characters/6175ae9112e7cde1912e5b40')
        .send({})
        .expect(404)
        .then((res) => {
          expect(res.body).toEqual({
            statusCode: 404,
            message: 'Character #6175ae9112e7cde1912e5b40 not found',
            error: 'Not Found',
          });
        });
    });
  });

  describe('/characters (DELETE)', () => {
    it('should return deleted object', async () => {
      const fixture = { name: 'Test 1', episodes: [Episodes.JEDI] };

      const firstResult = await service.create(fixture);

      await request(app.getHttpServer())
        .delete('/characters/' + firstResult._id)
        .expect(200)
        .then((res) => {
          expect(res.body.name).toEqual(fixture.name);
          expect(res.body.episodes).toStrictEqual(fixture.episodes);
          expect(res.body.planet).toBeUndefined();
          expect(typeof res.body._id).toEqual('string');
          expect(typeof res.body.__v).toEqual('number');
        });
    });

    it('should return 404 on deleting missing resource', async () => {
      await request(app.getHttpServer())
        .delete('/characters/6175ae9112e7cde1912e5b40')
        .expect(404)
        .then((res) => {
          expect(res.body).toEqual({
            statusCode: 404,
            message: 'Character #6175ae9112e7cde1912e5b40 not found',
            error: 'Not Found',
          });
        });
    });
  });
});
