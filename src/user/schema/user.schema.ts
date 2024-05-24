import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document, ObjectId } from 'mongoose';
import { UserType } from '../user-types.enum';
import * as mongoose from 'mongoose';
import { Exclude, Transform, Type } from 'class-transformer';

@Schema({ timestamps: true, toJSON: { virtuals: true, getters: true } })
export class User {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ required: true })
  name: string;
  @Prop({ required: true, enum: UserType })
  userType: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  @Exclude()
  password: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
