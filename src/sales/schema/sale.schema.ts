import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../../user/schema/user.schema';
import { Transform, Type } from 'class-transformer';
import { Product } from '../../product/schema/product.schema';

export type SaleDocument = HydratedDocument<Sale>;

@Schema({
  timestamps: true,
})
export class Sale {
  @Prop()
  amount: number;

  @Prop()
  commission: number;

  @Prop({default: false})
  isCommissionPaid: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  @Type(() => User)
  @Transform(({ value }) => value.toJSON())
  agent: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  @Type(() => Product)
  @Transform(({ value }) => value.toJSON())
  product: Product;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
