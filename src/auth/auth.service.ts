import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginUserDto } from '../users/dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Hash the user's password and  Generate a salt
    const salt = randomBytes(8).toString('hex');

    // Hash salt and password
    const hash = (await scrypt(createUserDto.password, salt, 32)) as Buffer;

    // Join the hashed password and the salt together with a period (.)
    const hashedPassword = salt + '.' + hash.toString('hex');

    // Update the createUserDto with the hashed password
    createUserDto.password = hashedPassword;

    // Create a new user and save it
    let user = await this.usersService.create(createUserDto);

    if (!user) {
      throw new BadRequestException({
        status: 'Bad request',
        message: 'Registration unsuccessful',
        statusCode: 400,
      });
    }

    // Generate jwt token
    user = user as User;
    delete user.password;

    const token = await this.getJwtToken(user.userId);

    return {
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken: token,
        user,
      },
    };
  }

  async login(payload: LoginUserDto) {
    const { email, password } = payload;

    // Find the user by email
    const user =
      await this.usersService.getUserByEmailAndIncludePassword(email);

    // If the user doesn't exist, throw an error
    if (!user) {
      throw new UnauthorizedException({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401,
      });
    }

    // Get hashed password from the database
    const [salt, hash] = user.password.split('.');

    // Hash the salt and the password together
    const hashedPassword = (await scrypt(password, salt, 32)) as Buffer;

    // Compare this hashed passsword from the user input against the hashed password in the database
    if (hash !== hashedPassword.toString('hex')) {
      throw new UnauthorizedException({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401,
      });
    }

    const token = await this.getJwtToken(user.userId);

    return {
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    };
  }

  async getJwtToken(userId: string) {
    return await this.jwtService.signAsync({ userId });
  }
}
