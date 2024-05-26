import { TestingModule, Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';

const mockUserModel = {
  // Mock your model methods here
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  aggregate: jest.fn(),
  updateMany: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<UserDocument>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        UserService,
        { provide: getModelToken('User'), useValue: mockUserModel },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    userModel = module.get<Model<UserDocument>>(getModelToken('User'));
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          name: 'Test User',
          email: '2tXqg@example.com',
          _id: '6653581090fb9cc18b957f84',
          createdAt: '2024-05-26T15:41:04.808Z',
          updatedAt: '2024-05-26T15:41:04.808Z',
          __v: 0,
        },
      ];
      mockUserModel.find.mockResolvedValue(mockUsers);
      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const mockUser = {
        name: 'Test User',
        email: '2tXqg@example.com',
        _id: '6653581090fb9cc18b957f84',
        createdAt: '2024-05-26T15:41:04.808Z',
        updatedAt: '2024-05-26T15:41:04.808Z',
        __v: 0,
      };
      mockUserModel.findById.mockResolvedValue(mockUser);
      const result = await service.findOne('6653581090fb9cc18b957f84');
      expect(result).toEqual(mockUser);
    });
  });
});
