// test-utils.ts
import { DataSource } from 'typeorm';
import { databaseConfig } from '../src/database.config';

export const testDataSource = new DataSource(databaseConfig as any);

export const initializeTestDataSource = async () => {
  await testDataSource.initialize();
};

export const cleanupDatabase = async () => {
  const entities = testDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = testDataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
  }
};
