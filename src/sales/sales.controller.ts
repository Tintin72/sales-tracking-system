import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Res,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import TokenPayload from 'src/auth/auth.interface';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  /**
   * Creates a new sale based on the provided createSaleDto.
   *
   * @param {CreateSaleDto} createSaleDto - The data for creating a new sale.
   * @param {Response} response - The response object.
   * @param {Request} req - The request object.
   * @return {Promise<any>} The created sale object.
   * @throws {HttpException} If there is an error creating the sale.
   */
  async create(
    @Body() createSaleDto: CreateSaleDto,
    @Res() response,
    @Req() req,
  ) {
    try {
      const user: TokenPayload = req.user;
      const sale = await this.salesService.recordSale(createSaleDto, user);
      return response.status(HttpStatus.CREATED).json(sale);
    } catch (e) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: e.message });
    }
  }

  @Get('/user')
  @UseGuards(JwtAuthGuard)
  /**
   * Retrieves the sales made by an individual agent.
   *
   * @param {Request} req - The request object containing the user information.
   * @param {Response} response - The response object used to send the sales data.
   * @return {Promise<Response>} The response object containing the sales data or an error message.
   */
  async findIndividualAgentSales(@Req() req, @Res() response) {
    try {
      const user: TokenPayload = req.user;
      const sales = await this.salesService.findUserSales(user.userId);
      return response.status(HttpStatus.OK).json(sales);
    } catch (e) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: e.message });
    }
  }

  //get user grouped sales
  @Get('/user/grouped')
  async getGroupedUserSales(@Req() req, @Res() response) {
    try {
      const sales = await this.salesService.groupedAgentUnpaidCommission();
      return response.status(HttpStatus.OK).json(sales);
    } catch (e) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: e.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/date')
  async userSalesByDate(
    @Req() req,
    @Res() response,
    @Query('start_date') start_date,
    @Query('end_date') end_date,
  ) {
    try {
      const user: TokenPayload = req.user;
      const sales = await this.salesService.getUserSalesByDate(
        start_date,
        end_date,
        user.userId,
      );
      return response.status(HttpStatus.OK).json(sales);
    } catch (e) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: e.message });
    }
  }

  @Get('/email')
  @UseGuards(JwtAuthGuard)
  /**
   * Asynchronously sends the sales made by a user to their email address.
   *
   * @param {Req} req - The request object.
   * @param {Res} response - The response object.
   * @return {Promise<Response>} The response object with the sales data or an error message.
   */
  async sendUserSalesByEmail(
    @Res() response,
    @Query('start_date') start_date,
    @Query('end_date') end_date,
  ) {
    try {
      const sales = await this.salesService.sendUserSalesByEmail(
        start_date,
        end_date,
      );
      return response.status(HttpStatus.OK).json({
        message: sales,
      });
    } catch (e) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: e.message });
    }
  }

  @Get()
  /**
   * Retrieves all sales records.
   *
   * @return {Promise<Sale[]>} A promise that resolves to an array of sale records.
   */
  async findAll() {
    return await this.salesService.findAll();
  }

  @Get(':id')
  /**
   * Retrieves a sale by its ID and returns it as a JSON response.
   *
   * @param {string} id - The ID of the sale to retrieve.
   * @param {Response} response - The response object to send the JSON response with.
   * @return {Promise<Response>} The JSON response containing the sale if found, or an error message if not found.
   */
  async findOne(@Param('id') id: string, @Res() response) {
    const sale = await this.salesService.findOne(id);
    if (!sale) {
      return response.status(HttpStatus.NOT_FOUND).json({
        message: 'Sale not found',
      });
    }
    return response.status(HttpStatus.OK).json(sale);
  }

  @Patch(':id')
  /**
   * Updates a sale by its ID.
   *
   * @param {string} id - The ID of the sale to update.
   * @param {UpdateSaleDto} updateSaleDto - The data to update the sale with.
   * @param {Response} response - The response object to send the result.
   * @return {Promise<Sale | void>} - The updated sale if it exists, or void if it doesn't.
   */
  async update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    @Res() response,
  ) {
    const sale = await this.salesService.update(id, updateSaleDto);
    if (!sale) {
      return response.status(HttpStatus.NOT_FOUND).json({
        message: 'Sale not found',
      });
    }
    return response.status(HttpStatus.OK).json(sale);
  }

  @Delete(':id')
  /**
   * Asynchronously removes a sale with the given ID from the database.
   *
   * @param {string} id - The ID of the sale to remove.
   * @param {Response} response - The response object to send the result.
   * @return {Promise<Response>} The response object with the result of the deletion.
   */
  async remove(@Param('id') id: string, @Res() response) {
    const sale = await this.salesService.remove(id);
    if (!sale) {
      return response.status(HttpStatus.NOT_FOUND).json({
        message: 'Sale not found',
      });
    }
    return response.status(HttpStatus.NO_CONTENT).json({
      message: 'Sale deleted successfully',
    });
  }
}
