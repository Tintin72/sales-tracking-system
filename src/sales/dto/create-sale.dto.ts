import { IsNotEmpty } from 'class-validator';

export class CreateSaleDto {
  @IsNotEmpty()
  products: string[];

  //   @IsNotEmpty()
  //   readonly amount: number;

  //   @IsNotEmpty()
  //   readonly commission: number;
}
