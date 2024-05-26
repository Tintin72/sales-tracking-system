import { Injectable, Logger } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

import { SaleDocument } from './schema/sale.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import TokenPayload from 'src/auth/auth.interface';
import { ProductService } from 'src/product/product.service';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { EmailContent } from 'src/email/email.interface';
import { ProducerService } from 'src/queues/producer.queue';
import { Cron } from '@nestjs/schedule';
import mongoose from 'mongoose';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);
  constructor(
    @InjectModel('Sale') private saleModel: Model<SaleDocument>,
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly producerService: ProducerService,
  ) {}
  /**
   * Creates a new sale with the given data and owner.
   *
   * @param {CreateSaleDto} createSaleDto - The data for the sale to be created.
   * @param {TokenPayload} owner - The owner of the sale.
   * @return {Promise<SaleDocument>} The created sale.
   */
  async create(createSaleDto: CreateSaleDto, owner: TokenPayload) {
    const product = await this.productService.findOne(createSaleDto.product);
    if (!createSaleDto.amount) {
      createSaleDto.amount = product.price;
    }

    //calculate the total amount
    const commission =
      createSaleDto.amount *
      this.configService.get('SALES_COMMISSION_PERCENTAGE');

    const createdSale = new this.saleModel({
      ...createSaleDto,
      commission,
      owner: owner.userId,
    });

    await createdSale.populate({
      path: 'product',
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
      .populate({ path: 'product', select: 'name price', model: 'Product' });
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
      .populate({ path: 'product', select: 'name price', model: 'Product' });
    return sales;
  }

  /**
   * Sends the user's sales information by email.
   *
   * @param {string} id - The ID of the user.
   * @return {Promise<string>} - A promise that resolves to the email body containing the total amount and total commission.
   */
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

  async update(id: string, updateSaleDto: UpdateSaleDto) {
    return this.saleModel.findByIdAndUpdate(id, updateSaleDto, { new: false });
  }

  async findAll() {
    return await this.saleModel
      .find()
      .populate({ path: 'owner', select: 'name email' })
      .populate({ path: 'product', select: 'name price', model: 'Product' });
  }

  async findOne(id: string) {
    return await this.saleModel
      .findById(id)
      .populate({ path: 'owner', select: 'name email' })
      .populate({ path: 'product', select: 'name price', model: 'Product' });
  }

  async remove(id: string) {
    return await this.saleModel.findByIdAndDelete(id);
  }
}
