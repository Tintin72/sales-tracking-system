import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import mongoose from 'mongoose';
import { SalesController } from '../sales.controller';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { SalesService } from '../sales.service';
import { SaleDocument } from '../schema/sale.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ProductDocument } from 'src/product/schema/product.schema';
import { UserSalesByDateResponse } from '../sales.interface';

describe('SalesController (e2e)', () => {
  let app: INestApplication;
  let salesController: SalesController;
  let salesService: SalesService;
  let saleModel: Model<SaleDocument>;
  let productModel: Model<ProductDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        SalesService,
        {
          provide: getModelToken('Sale'),
          useValue: saleModel,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    salesController = module.get<SalesController>(SalesController);
    salesService = module.get<SalesService>(SalesService);
    saleModel = module.get<Model<SaleDocument>>(getModelToken('Sale'));
    productModel = module.get<Model<ProductDocument>>(getModelToken('Product'));
    await app.init();
  });
  it('should be defined', () => {
    expect(salesController).toBeDefined();
  });

  it('/sales (POST)', async () => {
    return request(app.getHttpServer())
      .post('/sales')
      .send({
        product: new mongoose.Types.ObjectId(),
        amount: 10,
        agent: 'agent',
      })
      .expect(HttpStatus.CREATED);
  });
});
