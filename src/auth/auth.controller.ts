import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  @Post('/register')
  register(@Body() body: CreateUserDto) {
    return { message: 'Registration successful!' };
  }

  @Post('/login')
  login() {
    return { message: 'Login successful!' };
  }
}
