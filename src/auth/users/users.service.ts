import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone: string,
  ) {
    const user = this.repo.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      phone: phone,
    });
    return this.repo.save(user);
  }

  async find(email: string) {
    return this.repo.findOne({ where: { email } });
  }
}
