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
  async findUserSales(@Req() req, @Res() response, @Query('email') query) {
    try {
      const user: TokenPayload = req.user;
      if (query) {
        console.log('query', query);
        try {
          const sales = await this.salesService.findUserSalesByEmail(query);
          return response.status(HttpStatus.OK).json(sales);
        } catch (e) {
          throw e;
          // return response
          //   .status(HttpStatus.BAD_REQUEST)
          //   .json({ message: e.message });
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

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
