import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dtos/create-user.dto';
import { LoginUserDto } from './users/dtos/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('/register')
  async register(@Body() body: CreateUserDto) {
    // Implement registration logic here
    const user = await this.authService.register(
      body.firstName,
      body.lastName,
      body.email,
      body.password,
      body.phone,
    );
    return user;
    // return { message: 'Registration successful!' };
  }

  @Post('/login')
  async login(@Body() body: LoginUserDto) {
    // Implement login logic here
    const user = await this.authService.login(body.email, body.password);
    return user;
    //return { message: 'Login successful!' };
  }
}
