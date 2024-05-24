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
      const sale = await this.salesService.create(createSaleDto, req.user);
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
   * Retrieves the sales made by a user based on the provided query parameters.
   *
   * @param {Req} req - The request object.
   * @param {Res} response - The response object.
   * @param {string} query - The email query parameter.
   * @return {Promise<Response>} The response object with the sales data or an error message.
   */
  async findUserSales(@Req() req, @Res() response, @Query('email') query) {
    try {
      const user: TokenPayload = req.user;
      if (query) {
        console.log('query', query);
        try {
          const sales = await this.salesService.findUserSalesByEmail(query);
          return response.status(HttpStatus.OK).json(sales);
        } catch (e) {
          return response
            .status(HttpStatus.BAD_REQUEST)
            .json({ message: e.message });
        }
      }
      const sales = await this.salesService.findUserSales(user.userId);
      return response.status(HttpStatus.OK).json(sales);
    } catch (e) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: e.message });
    }
  }

  @Get('/email')
  @UseGuards(JwtAuthGuard)
  async sendUserSalesByEmail(@Req() req, @Res() response) {
    try {
      const user: TokenPayload = req.user;
      const sales = await this.salesService.sendUserSalesByEmail(user.userId);
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
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(id, updateSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}
