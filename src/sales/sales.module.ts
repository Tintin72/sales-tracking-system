import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SaleSchema } from './schema/sale.schema';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { QueuesModule } from '../queues/queues.module';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  imports: [
    MongooseModule.forFeature([{ name: 'Sale', schema: SaleSchema }]),
    ProductModule,
    UserModule,
    ConfigModule,
    QueuesModule,
  ],
})
export class SalesModule {}
