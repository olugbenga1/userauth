import { forwardRef, Module } from '@nestjs/common';
import { OrganisationModule } from '../organisation/organisation.module';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';

@Module({
  imports: [
    forwardRef(() => OrganisationModule),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService],
})
export class UsersModule {}
