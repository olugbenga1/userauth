import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { LoginUserDto } from '../users/dtos/login-user.dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/auth/register')
  async register(@Body() payload: CreateUserDto) {
    return await this.authService.register(payload);
  }

  @HttpCode(200)
  @Post('/auth/login')
  async login(@Body() payload: LoginUserDto) {
    return await this.authService.login(payload);
  }
}
