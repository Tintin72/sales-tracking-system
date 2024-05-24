import { IsNotEmpty } from 'class-validator';

export class CreateSaleDto {
  @IsNotEmpty()
  product: string;

  amount: number;
}
