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
  async recordSale(createSaleDto: CreateSaleDto, owner: TokenPayload) {
    const product = await this.productService.findOne(createSaleDto.product);
    if (!createSaleDto.amount) {
      createSaleDto.amount = product.price;
    }

    //calculate the total amount
    const commission = this.calculateCommission(createSaleDto.amount);

    const createdSale = new this.saleModel({
      ...createSaleDto,
      commission,
      agent: owner.userId,
    });

    await createdSale.populate({
      path: 'product',
      select: 'name price',
      model: 'Product',
    });
    await createdSale.populate({ path: 'agent', select: 'name email' });

    return createdSale.save();
  }

  /**
   * Calculates the commission for a given sale amount based on the commission percentage
   * specified in the configuration.
   *
   * @param {number} saleAmount - The amount of the sale.
   * @return {number} The calculated commission for the sale.
   */
  calculateCommission(saleAmount: number) {
    return saleAmount * this.configService.get('SALES_COMMISSION_PERCENTAGE');
  }

  async markCommissionsAsPaid(agentId: string, startDate: Date, endDate: Date) {
    const result = await this.saleModel.updateMany(
      {
        agent: agentId,
        createdAt: { $gte: startDate, $lte: endDate },
        isCommissionPaid: false,
      },
      { $set: { isCommissionPaid: true } },
    );
    // Returns the number of documents modified
    return result.modifiedCount;
  }

  /**
   * Retrieves all sales belonging to a specific user within a given date range.
   *
   * @param {Date} start_date - The start date of the date range.
   * @param {Date} end_date - The end date of the date range.
   * @param {string} userId - The ID of the user.
   * @return {Promise<{ totalSalesAmount: number, totalCommission: number }>} An object containing the total sales amount and total commission for the user within the given date range.
   */
  async getUserSalesByDate(start_date: Date, end_date: Date, userId: string) {
    //if endDate is empty, set it to now
    // Convert date strings to Date objects
    const startDate = new Date(start_date);
    const endDate = end_date ? new Date(end_date) : new Date();

    const sales = await this.saleModel.aggregate([
      {
        $match: {
          agent: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$amount' },
          totalCommission: { $sum: '$commission' },
        },
      },
    ]);
    return sales[0] || { totalSalesAmount: 0, totalCommission: 0 };
  }

  /**
   * Groups sales by agent and adds agent fields to the query.
   *
   * @return {Promise<Array<{ agent: { _id: string, name: string, email: string, id: string }, totalSalesAmount: number, totalCommission: number }>>} - The sales grouped by agent.
   */
  async groupedAgentUnpaidCommission() {
    const sales = await this.saleModel
      .aggregate([
        {
          $match: {
            isCommissionPaid: false,
          },
        },
        {
          $group: {
            _id: '$agent',
            totalSalesAmount: { $sum: '$amount' },
            totalCommission: { $sum: '$commission' },
          },
        },
        {
          $lookup: {
            from: 'users', // Name of the user collection
            localField: '_id',
            foreignField: '_id',
            as: 'agentDetails',
          },
        },
        {
          $unwind: '$agentDetails',
        },
        {
          $project: {
            _id: 0,
            agent: {
              _id: '$agentDetails._id',
              name: '$agentDetails.name',
              email: '$agentDetails.email',
              id: '$agentDetails._id',
            },
            totalSalesAmount: 1,
            totalCommission: 1,
          },
        },
      ])
      .exec();
    return sales;
  }

  /**
   * Retrieves all sales belonging to a specific user.
   *
   * @param {string} userId - The ID of the user.
   * @return {Promise<SaleDocument[]>} A promise that resolves to an array of sales documents belonging to the user.
   */
  async findUserSales(userId: string) {
    const sales = await this.saleModel
      .find({ agent: userId })
      .populate({ path: 'agent', select: 'name email' })
      .populate({ path: 'product', select: 'name price', model: 'Product' });
    return sales;
  }

  /**
   * Sends sales reports to agents based on the provided date range.
   *
   * @param {string} start_date - The start date of the date range in string format.
   * @param {string} end_date - The end date of the date range in string format. If not provided, the current date will be used.
   * @return {Promise<string>} A promise that resolves to a string indicating the success of sending the emails.
   */
  async sendUserSalesByEmail(start_date, end_date) {
    //if endDate is empty, set it to now
    // Convert date strings to Date objects
    const startDate = new Date(start_date);
    const endDate = end_date ? new Date(end_date) : new Date();

    //return sales for all agents grouped by agent returning details of the user and product in the sale
    const sales = await this.saleModel
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $lookup: {
            from: 'users', // Name of the user collection
            localField: 'agent',
            foreignField: '_id',
            as: 'agentDetails',
          },
        },
        {
          $unwind: '$agentDetails',
        },
        {
          $lookup: {
            from: 'products', // Name of the product collection
            localField: 'product',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        {
          $unwind: '$productDetails',
        },
        {
          $group: {
            _id: '$agent',
            agent: { $first: '$agentDetails' },
            sales: {
              $push: {
                _id: '$_id',
                amount: '$amount',
                commission: '$commission',
                isCommissionPaid: '$isCommissionPaid',
                createdAt: '$createdAt',
                product: {
                  _id: '$productDetails._id',
                  name: '$productDetails.name',
                  price: '$productDetails.price',
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            agent: {
              _id: '$agent._id',
              name: '$agent.name',
              email: '$agent.email',
              id: '$agent._id',
            },
            sales: 1,
          },
        },
      ])
      .exec();

    //send emails from each agent with details of the product sold and amount sold
    //for each agent
    const emailsPromises = sales.map((groupedSalesItem) => {
      const emailContent = {
        subject: `Your Sales Report for ${startDate} to ${endDate}`,
        email: groupedSalesItem.agent.email,
        html: `
          <h3>Hello ${groupedSalesItem.agent.name}</h3>
          <ul>
            ${groupedSalesItem.sales
              .map(
                (saleItem) => `
                <li>
                  Product Name: ${saleItem.product.name}.
                  Sale Amount: ${saleItem.amount}.
                  Commission: ${saleItem.commission}
                </li>
              `,
              )
              .join('')}
          </ul>
        `,
      };
      return this.producerService.addToEmailQueue(emailContent);
    });

    await Promise.all(emailsPromises);

    return 'Emails sent successfully';
  }

  @Cron('0 0 12 15 * *')
  async sendUnpaidCommissionByEmail() {
    const groupedSales = await this.groupedAgentUnpaidCommission();

    for (const sale of groupedSales) {
      const emailBody = `Your Total Pending Commission is ${sale.totalCommission}`;
      const html = `<h3> Hello ${sale.agent.name} </h3><p>${emailBody}</p>`;
      const emailContent: EmailContent = {
        subject: 'Total Unpaid Commissions',
        email: sale.agent.email,
        html,
      };
      await this.producerService.addToEmailQueue(emailContent);
    }
  }

  /**
   * Updates a sale in the database.
   *
   * @param {string} id - The ID of the sale to update.
   * @param {UpdateSaleDto} updateSaleDto - The data to update the sale with.
   * @return {Promise<Sale>} - A promise that resolves to the updated sale.
   */
  async update(id: string, updateSaleDto: UpdateSaleDto) {
    return this.saleModel.findByIdAndUpdate(id, updateSaleDto, { new: false });
  }

  /**
   * Retrieves all sales from the database, along with the associated owner's name and email,
   * and the product's name and price.
   *
   * @return {Promise<Sale[]>} A promise that resolves to an array of Sale objects.
   */
  async findAll() {
    return await this.saleModel
      .find()
      .populate({ path: 'agent', select: 'name email' })
      .populate({ path: 'product', select: 'name price', model: 'Product' });
  }

  /**
   * Finds a sale document by its ID and populates the owner and product fields.
   *
   * @param {string} id - The ID of the sale document to find.
   * @return {Promise<SaleDocument | null>} - A promise that resolves to the sale document with the given ID,
   * or null if it doesn't exist. The sale document will have the owner and product fields populated.
   */
  async findOne(id: string) {
    return await this.saleModel
      .findById(id)
      .populate({ path: 'agent', select: 'name email' })
      .populate({ path: 'product', select: 'name price', model: 'Product' });
  }

  /**
   * Removes a sale document from the database using its ID.
   *
   * @param {string} id - The ID of the sale document to remove.
   * @return {Promise<SaleDocument | null>} - A promise that resolves to the removed sale document, or null if it doesn't exist.
   */
  async remove(id: string) {
    return await this.saleModel.findByIdAndDelete(id);
  }
}
