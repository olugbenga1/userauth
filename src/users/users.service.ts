import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { OrganisationService } from '../organisation/organisation.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(forwardRef(() => OrganisationService))
    private organisationService: OrganisationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User | boolean> {
    try {
      const newUser = await this.userRepo.save(
        this.userRepo.create(createUserDto),
      );

      if (!newUser) {
        return false;
      }

      await this.organisationService.create(
        {
          name: `${newUser.firstName}'s Organisation`,
          description: '',
        },
        [newUser],
      );

      return newUser;
    } catch (error) {
      return false;
    }
  }

  async find(email: string) {
    return await this.userRepo.findOne({
      where: { email },
      // relations: ['organization'],
    });
  }

  async findOne(userId: string) {
    if (!userId) {
      return null;
    }

    return await this.userRepo.findOne({ where: { userId } });
  }

  async getUserByEmailAndIncludePassword(email: string) {
    return await this.userRepo.findOne({
      where: { email },
      select: ['userId', 'firstName', 'lastName', 'email', 'password', 'phone'],
    });
  }
}
