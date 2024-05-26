// sales.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { getModelToken } from '@nestjs/mongoose';
import { ProductService } from 'src/product/product.service';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { ProducerService } from 'src/queues/producer.queue';
import { SaleDocument } from './schema/sale.schema';
import { Model } from 'mongoose';
import { CreateSaleDto } from './dto/create-sale.dto';
import TokenPayload from 'src/auth/auth.interface';
import { UserSalesByDateResponse } from './sales.interface';

const mockSaleModel = {
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

const mockProductService = {
  findOne: jest.fn(),
};

const mockUserService = {
  findOne: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue(0.03), // Mock commission percentage as 10%
};

const mockProducerService = {
  addToEmailQueue: jest.fn(),
};

describe('SalesService', () => {
  let service: SalesService;
  let saleModel: Model<SaleDocument>;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: getModelToken('Sale'), useValue: mockSaleModel },
        { provide: ProductService, useValue: mockProductService },
        { provide: UserService, useValue: mockUserService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ProducerService, useValue: mockProducerService },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    saleModel = module.get<Model<SaleDocument>>(getModelToken('Sale'));
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordSale', () => {
    it('should create and save a new sale', async () => {
      //obtain product from product service
      const createSaleDto: CreateSaleDto = {
        product: '6650f7066e752e68aa370325',
        amount: 62000,
      };
      const agent: TokenPayload = {
        userId: '665364d74b5d528defb2b5c1',
      };

      const mockSaleOutput = {
        amount: 62000,
        commission: 1860,
        isCommissionPaid: false,
        agent: {
          _id: '665364d74b5d528defb2b5c1',
          name: 'Test User',
          email: 'test.dev@gmail.com',
          id: '665364d74b5d528defb2b5c1',
        },
        product: {
          _id: '6650f7066e752e68aa370325',
          name: 'Hp Notebook',
          price: 45999,
        },
        _id: '66537cd41d5d1eea92311074',
        createdAt: '2024-05-26T18:17:56.925Z',
        updatedAt: '2024-05-26T18:17:56.925Z',
        __v: 0,
      };

      jest
        .spyOn(service, 'recordSale')
        .mockImplementationOnce(() => Promise.resolve(mockSaleOutput));
      expect(await service.recordSale(createSaleDto, agent)).toEqual(
        mockSaleOutput,
      );
    });
  });
  describe('calculateCommission', () => {
    it('should calculate commission correctly', () => {
      const saleAmount = 1000;
      const commission = service.calculateCommission(saleAmount);
      expect(commission).toBe(30);
    });
  });
  describe('getUserSalesByDate', () => {
    it('should get user sales by date', async () => {
      const startDate = new Date();
      const endDate = new Date();
      const userId = '665364d74b5d528defb2b5c1';
      const result = await service.getUserSalesByDate(startDate, endDate, userId);

      expect(result).toEqual({
        _id: null,
        totalSales: 0,
        totalCommission: 0,
      });
    });
  });
});
