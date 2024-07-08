import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { OrganisationModule } from './organisation/organisation.module';
import { UsersModule } from './users/users.module';
import { databaseConfig } from './database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    OrganisationModule,
    UsersModule,
  ],
  providers: [],
})
export class AppModule {}
