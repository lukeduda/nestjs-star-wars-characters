import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongoConnectionService {
  constructor(@InjectConnection() private connection: Connection) {}

  async dropMongoCollection(collectionName: string) {
    try {
      await this.connection.dropCollection(collectionName);
    } catch (e) {
      if (e.codeName !== 'NamespaceNotFound') {
        throw e;
      }
    }
  }

  async close() {
    await this.connection.close();
  }
}
