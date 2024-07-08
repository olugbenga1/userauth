import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  cleanupDatabase,
  initializeTestDataSource,
  testDataSource,
} from './test-utils';
import { User } from '../src/users/entities/user.entity';
import { customExceptionFactory } from '../src/filter/custom-exception';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let registeredUser: User;

  const testEmail = 'john14@example.com';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: customExceptionFactory,
      }),
    );
    await app.init();
    await initializeTestDataSource();
  });

  afterAll(async () => {
    // clean db
    await cleanupDatabase();
    await testDataSource.destroy();

    await app.close();
  });

  describe('POST Auth tests', () => {
    it('should return validation error if required fields are missing', async () => {
      // here we are not sending the required fields
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});
      const missingFields = ['firstName', 'lastName', 'email', 'password'];

      expect(response.body.statusCode).toBe(422);
      expect(response.body.status).toBe('Bad Request');
      response.body.errors.forEach((error) => {
        expect(error).toHaveProperty('field');
        expect(error).toHaveProperty('message');
        expect(missingFields).toContain(error.field);
      });
    });

    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: testEmail,
          password: 'password',
          phone: '1234567890',
        });

      const responseBody = response.body.data;

      expect(response.status).toBe(201);
      expect(responseBody).toHaveProperty('user');
      expect(responseBody).toHaveProperty('accessToken');
      expect(responseBody.user).toHaveProperty('userId');
      expect(responseBody.user).toHaveProperty('firstName');
      expect(responseBody.user).toHaveProperty('lastName');
      expect(responseBody.user).toHaveProperty('email');
      expect(responseBody.user).toHaveProperty('phone');

      registeredUser = responseBody.user;
    });

    it('should return an error if user already exists', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          firstName: registeredUser.firstName,
          lastName: registeredUser.lastName,
          email: registeredUser.email,
          password: 'password',
          phone: '1234567890',
        });

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBe('Registration unsuccessful');
    });

    it('should return 401 error if login fails', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'wrong password',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Authentication failed');
    });

    it('should login a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'password',
        });

      const responseBody = response.body.data;

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('accessToken');
      expect(responseBody).toHaveProperty('user');
      expect(responseBody.user).toHaveProperty('userId');
      expect(responseBody.user).toHaveProperty('firstName');
      expect(responseBody.user).toHaveProperty('lastName');
      expect(responseBody.user).toHaveProperty('email');
      expect(responseBody.user).toHaveProperty('phone');

      token = responseBody.accessToken;
    });

    it('should verify the default organisation is created', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/organisations')
        .set('Authorization', `Bearer ${token}`);

      const responseBody = response.body.data;

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('organisations');
      expect(responseBody.organisations).toHaveLength(1);
      expect(responseBody.organisations[0]).toHaveProperty('orgId');
      expect(responseBody.organisations[0]).toHaveProperty('name');
      expect(responseBody.organisations[0]).toHaveProperty('description');
      expect(responseBody.organisations[0].name.split("'")[0]).toEqual(
        registeredUser.firstName,
      );
      expect(responseBody.organisations[0].name).toEqual(
        `${registeredUser.firstName}'s Organisation`,
      );
    });
  });
});
