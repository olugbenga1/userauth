import { Injectable, BadRequestException } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dtos/create-user.dto';
import { LoginUserDto } from './users/dtos/login-user.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone: string,
  ) {
    // See if email already exists in the database
    const existingUser = await this.usersService.find(email);
    if (existingUser) {
      throw new BadRequestException(`email ${email} already exists`);
    }

    // Hash the user's password
    // Generate a salt
    const salt = randomBytes(8).toString('hex');

    // Hash salt and password
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed password and the salt together with a period (.)
    const hashedPassword = salt + '.' + hash.toString('hex');

    // Create a new user and save it
    const user = await this.usersService.create(
      firstName,
      lastName,
      email,
      hashedPassword,
      phone,
    );

    return user;
  }

  async login(email: string, password: string) {
    // Find the user by email
    const user = await this.usersService.find(email);

    // If the user doesn't exist, throw an error
    if (!user) {
      throw new BadRequestException('Invalid email or password provided');
    }

    // Get hashed password from the database
    const [salt, hash] = user.password.split('.');

    // Hash the salt and the password together
    const hashedPassword = (await scrypt(password, salt, 32)) as Buffer;

    // Compare this hashed passsword from the user input against the hashed password in the database
    if (hash !== hashedPassword.toString('hex')) {
      throw new BadRequestException('Invalid email or password provided');
    }

    return user;
  }
}
