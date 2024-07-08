import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organisation } from '../organisation/entities/organisation.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  const organisationRepositoryToken = getRepositoryToken(Organisation);
  const userRepositoryToken = getRepositoryToken(User);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUserWithFullDetails: jest.fn(),
          },
        },
        {
          provide: organisationRepositoryToken,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: userRepositoryToken,
          useValue: {},
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should generate a token that expires at the correct time', async () => {
    const userId = 'testUserId';

    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mockedToken');

    await authService.getJwtToken(userId);

    expect(jwtService.signAsync).toHaveBeenCalledWith({ userId });
  });

  it('should include correct user details in the token', async () => {
    const userId = 'testUserId';

    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ userId });

    const result = await jwtService.verifyAsync('mockedToken');

    expect(result).toEqual({ userId });
  });
});
