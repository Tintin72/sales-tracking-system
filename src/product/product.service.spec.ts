import { TestingModule, Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDocument } from './schema/product.schema';
import { UpdateProductDto } from './dto/update-product.dto';
import { Types } from 'mongoose';

const mockProductModel = {
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

describe('ProductService', () => {
  let service: ProductService;
  let productModel: Model<ProductDocument>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getModelToken('Product'), useValue: mockProductModel },
      ],
    }).compile();
    service = module.get<ProductService>(ProductService);
    productModel = module.get<Model<ProductDocument>>(getModelToken('Product'));
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
      };
      const mockProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
      };
      mockProductModel.create.mockResolvedValue(mockProduct);
      const result = await service.create(createProductDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
      };
      const mockProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
      };
      mockProductModel.findByIdAndUpdate.mockResolvedValue(mockProduct);
      const result = await service.update(
        '6653581090fb9cc18b957f84',
        updateProductDto,
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      mockProductModel.findByIdAndDelete.mockResolvedValue({});
      const result = await service.remove('6653581090fb9cc18b957f84');
      expect(result).toEqual({});
    });
  });

  describe('findOne', () => {
    it('should return a product', async () => {
      const mockProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
      };
      mockProductModel.findById.mockResolvedValue(mockProduct);
      const result = await service.findOne('6653581090fb9cc18b957f84');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        {
          name: 'Test Product',
          description: 'Test Description',
          price: 100,
        },
        {
          name: 'Test Product 2',
          description: 'Test Description 2',
          price: 200,
        },
      ];
      mockProductModel.find.mockResolvedValue(mockProducts);
      const result = await service.findAll();
      expect(result).toEqual(mockProducts);
    });
  });
});
