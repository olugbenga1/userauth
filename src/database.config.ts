import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Organisation } from './organisation/entities/organisation.entity';
import { User } from './users/entities/user.entity';
import { config } from 'dotenv';

config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Organisation],
  synchronize: true,
};
