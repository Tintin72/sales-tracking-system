import { HydratedDocument, Schema as MongooseSchema, ObjectId, Types } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/user/schema/user.schema';
import { Transform, Type } from 'class-transformer';
import { Product } from 'src/product/schema/product.schema';

export type SaleDocument = HydratedDocument<Sale>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class Sale {
  @Prop()
  amount: number;
  @Prop()
  commission: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  @Type(() => User)
  @Transform(({ value }) => value.toJSON())
  owner: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Product' }] })
  @Type(() => Product)
  @Transform(({ value }) => value.toJSON())
  products: Product[];
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
