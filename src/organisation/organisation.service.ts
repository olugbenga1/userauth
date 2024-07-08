import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrgDto } from './dtos/create-org.dto';
import { Organisation } from './entities/organisation.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrganisationService {
  constructor(
    @InjectRepository(Organisation) private orgRepo: Repository<Organisation>,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
  ) {}

  async create(createOrg: CreateOrgDto, users: User[]) {
    try {
      return await this.orgRepo.save(
        this.orgRepo.create({
          ...createOrg,
          users: users,
        }),
      );
    } catch (e) {
      return false;
    }
  }

  async find(orgId: string) {
    return await this.orgRepo.findOne({ where: { orgId } });
  }

  async findOne(orgId: string) {
    return await this.orgRepo.findOne({ where: { orgId } });
  }

  // Get all organizations a user belongs to or created
  // async findUsersOrganisations(userId: string): Promise<Organization[]> {
  //   return this.org.find({
  //     where: { user: { userId } },
  //     relations: ['user'],
  //   });
  // }

  // Logged in user gets a single organization record
  async findOrganization(id: string): Promise<Organisation> {
    const organization = await this.orgRepo.findOne({ where: { orgId: id } });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  async findUsersOrganisations(userId: string) {
    return this.orgRepo.find({
      where: { users: { userId } },
    });
  }

  async addUserToOrganisation(orgId: string, userId: string) {
    const org = await this.orgRepo.findOne({
      where: { orgId },
      relations: ['users'],
    });
    const user = await this.userService.findOne(userId);

    if (!org) {
      throw new NotFoundException(`Organization with ID ${orgId} not found`);
    }

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    org.users.push(user);

    await this.orgRepo.save(org);
  }
}
