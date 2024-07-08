import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Organisation } from '../organisation/entities/organisation.entity';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { OrganisationModule } from '../organisation/organisation.module';
import { UsersModule } from '../users/users.module';
config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organisation]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_REFRESH_EXPIRATION },
    }),
    forwardRef(() => OrganisationModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
