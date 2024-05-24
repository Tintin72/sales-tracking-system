import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { UserType } from '../user-types.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly name: string;

  @IsNotEmpty()
  @IsEnum(UserType)
  readonly userType: UserType;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
