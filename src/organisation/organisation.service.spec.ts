import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationService } from './organisation.service';
import { Organisation } from './entities/organisation.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

describe('OrganisationService', () => {
  let organisationService: OrganisationService;
  const organisationRepositoryToken = getRepositoryToken(Organisation);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationService,
        {
          provide: UsersService,
          useValue: {
            getUserOrganisations: jest.fn(),
          },
        },
        {
          provide: organisationRepositoryToken,
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    organisationService = module.get<OrganisationService>(OrganisationService);
  });

  it('should only return organisations the user has access to', async () => {
    const user = {
      userId: 'testUserId',
    } as User;

    const userOrgs = [
      { orgId: 'org1', name: 'Org 1' },
      { orgId: 'org2', name: 'Org 2' },
      { orgId: 'org3', name: 'Org 3' },
    ];

    jest
      .spyOn(organisationService, 'findUsersOrganisations')
      .mockResolvedValue(userOrgs as Organisation[]);

    const result = await organisationService.findUsersOrganisations(
      user.userId,
    );

    expect(result).toEqual(userOrgs);
    expect(organisationService.findUsersOrganisations).toHaveBeenCalledWith(
      user.userId,
    );
  });

  it('should not return organisations the user does not have access to', async () => {
    const user = {
      userId: 'testUserId',
    } as User;
    const userOrgs = [{ orgId: 'org1', name: 'Org 1' }];
    const allOrgs = [
      { orgId: 'org1', name: 'Org 1' },
      { orgId: 'org2', name: 'Org 2' },
      { orgId: 'org3', name: 'Org 3' },
    ];

    jest
      .spyOn(organisationService, 'findUsersOrganisations')
      .mockResolvedValue(userOrgs as Organisation[]);

    const result = await organisationService.findUsersOrganisations(
      user.userId,
    );

    expect(result).toEqual(userOrgs);
    expect(organisationService.findUsersOrganisations).toHaveBeenCalledWith(
      user.userId,
    );

    expect(result.length).not.toEqual(allOrgs.length);
    expect(result[0].orgId).toEqual(userOrgs[0].orgId);
  });
});
