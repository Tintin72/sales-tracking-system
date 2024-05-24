import { Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

import { SaleDocument } from './schema/sale.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import TokenPayload from 'src/auth/auth.interface';
import { ProductService } from 'src/product/product.service';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { EmailContent } from 'src/email/email.interface';
import { ProducerService } from 'src/queues/producer.queue';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel('Sale') private saleModel: Model<SaleDocument>,
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly producerService: ProducerService,
  ) {}
  async create(createSaleDto: CreateSaleDto, owner: TokenPayload) {
    const products = await this.productService.findByIds(
      createSaleDto.products,
    );

    //calculate the total amount
    let totalAmount = 0;
    products.forEach((product) => {
      totalAmount += product.price;
    });

    const commission =
      totalAmount * this.configService.get('SALES_COMMISSION_PERCENTAGE');

    const createdSale = new this.saleModel({
      ...createSaleDto,
      amount: totalAmount,
      commission,
      owner: owner.userId,
    });

    await createdSale.populate({
      path: 'products',
      select: 'name price',
      model: 'Product',
    });
    await createdSale.populate({ path: 'owner', select: 'name email' });
    return createdSale.save();
  }

  /**
   * Retrieves all sales belonging to a specific user.
   *
   * @param {string} userId - The ID of the user.
   * @return {Promise<SaleDocument[]>} A promise that resolves to an array of sales documents belonging to the user.
   */
  async findUserSales(userId: string) {
    const sales = await this.saleModel
      .find({ owner: userId })
      .populate({ path: 'owner', select: 'name email' })
      .populate({ path: 'products', select: 'name price', model: 'Product' });
    return sales;
  }

  /**
   * Finds sales by the user's email.
   *
   * @param {string} email - The email of the user.
   * @return {Promise<SaleDocument[]>} An array of sales documents belonging to the user.
   * @throws {Error} If the user is not found.
   */
  async findUserSalesByEmail(email: string) {
    //obtain the user from email
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }
    //filter sales by owners email
    const sales = await this.saleModel
      .find({ owner: user._id })
      .populate({ path: 'owner', select: 'name email' })
      .populate({ path: 'products', select: 'name price', model: 'Product' });
    return sales;
  }

  async sendUserSalesByEmail(id: string) {
    const sales = await this.findUserSales(id);
    const user = await this.userService.findOne(id);
    const totalAmount = sales.reduce((acc, sale) => acc + sale.amount, 0);
    const totalCommission = sales.reduce(
      (acc, sale) => acc + sale.commission,
      0,
    );

    const emailBody = `Total amount: ${totalAmount}. Total commission: ${totalCommission}`;
    const html = `<h3> Hello ${user.name} </h3><p>${emailBody}</p>`;
    const emailContent: EmailContent = {
      subject: 'Your Sales',
      email: user.email,
      html,
    };

    await this.producerService.addToEmailQueue(emailContent);
    return emailBody;
  }

  findAll() {
    return `This action returns all sales`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sale`;
  }

  update(id: number, updateSaleDto: UpdateSaleDto) {
    return `This action updates a #${id} sale`;
  }

  remove(id: number) {
    return `This action removes a #${id} sale`;
  }
}
