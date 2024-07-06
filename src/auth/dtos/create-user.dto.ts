import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  userId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  phone: string;
}
