import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/schema/user.schema';
import { Model } from 'mongoose';
// import { JwtPayload } from './auth.interface';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserType } from 'src/user/user-types.enum';
import { UserService } from 'src/user/user.service';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  const mockUserModel = {
    new: jest.fn().mockResolvedValue({
      save: jest.fn(),
    }),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('signUp', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
      userType: UserType.Agent,
      // Add other properties of CreateUserDto if needed
    };

    it('should throw ConflictException if user already exists', async () => {
      userService.findOneByEmail = jest
        .fn()
        .mockResolvedValue({ email: 'test@example.com' });

      await expect(service.signUp(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.findOneByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
    });

    it('should create a new user and return the saved user document', async () => {
      userService.findOneByEmail = jest.fn().mockResolvedValue(null);
      const savedUser = {
        name: 'Test User',
        userType: 'Agent',
        email: 'test@example.com',
        _id: '6653581090fb9cc18b957f84',
        createdAt: '2024-05-26T15:41:04.808Z',
        updatedAt: '2024-05-26T15:41:04.808Z',
        __v: 0,
        id: '6653581090fb9cc18b957f84',
      };
      mockUserModel.create.mockResolvedValue(savedUser);
      const result = await service.signUp(createUserDto);

      expect(result).toEqual(savedUser);
      expect(userService.findOneByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
    });
  });
  describe('signIn', () => {
    const email = 'test@example.com';
    const password = 'password';
    const userId = '6653581090fb9cc18b957f84';
    const user = {
      email,
      password: 'hashedPassword',
      _id: userId,
    };
    it('should throw NotFoundException if user is not found', async () => {
      mockUserModel.findOne = jest.fn().mockResolvedValue(null);
      jest
        .spyOn(service, 'signIn')
        .mockRejectedValueOnce(new NotFoundException('User not found'));
      await expect(service.signIn(email, password)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUserModel.findOne = jest.fn().mockResolvedValue(user);
      jest
        .spyOn(service, 'signIn')
        .mockRejectedValueOnce(
          new UnauthorizedException('Invalid credentials'),
        );
      await expect(service.signIn(email, 'wrongPassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
    it('should sign in and return the access token', async () => {
      const mockToken = 'mock_token';
      mockUserModel.findOne = jest.fn().mockResolvedValue(user);
      jest
        .spyOn(service, 'signIn')
        .mockResolvedValueOnce({ access_token: mockToken });
      const result = await service.signIn(email, password);
      expect(result).toEqual({ access_token: mockToken });
    });
  });
});
