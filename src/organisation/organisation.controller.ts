import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateOrgDto } from './dtos/create-org.dto';
import { AddUserToOrgDto } from './dtos/add-user-to-org.dto';

@Controller('/api/organisations')
export class OrganisationController {
  constructor(private organisationService: OrganisationService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getUserOrganisations(@CurrentUser() user: User) {
    const orgs = await this.organisationService.findUsersOrganisations(
      user.userId,
    );

    return {
      status: 'success',
      data: {
        organisations: orgs,
      },
      message: 'Organisations retrieved successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getOrganisation(@CurrentUser() user: User, @Param('id') id: string) {
    const org = await this.organisationService.findOrganization(id);

    return {
      status: 'success',
      data: org,
      message: 'Organisation retrieved successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Post()
  async createOrganisation(
    @CurrentUser() user: User,
    @Body() payload: CreateOrgDto,
  ) {
    const org = await this.organisationService.create(payload, [user]);

    if (!org) {
      throw new BadRequestException({
        status: 'Bad Request',
        message: 'Client error',
        statusCode: 400,
      });
    }

    return {
      status: 'success',
      data: {
        orgId: org.orgId,
        name: org.name,
        description: org.description,
      },
      message: 'Organisation created successfully',
    };
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Post(':orgId/users')
  async addUserToOrganisation(
    @Param('orgId') orgId: string,
    @Body() payload: AddUserToOrgDto,
  ) {
    await this.organisationService.addUserToOrganisation(orgId, payload.userId);
    return {
      status: 'success',
      message: 'User added to organisation successfully',
    };
  }
}
