import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  /**
   * Creates a new product using the provided data.
   *
   * @param {@Res()} response - The response object to send the result.
   * @param {CreateProductDto} createProductDto - The data for creating the product.
   * @return {Promise<void>} - A promise that resolves when the response is sent.
   */
  async create(@Res() response, @Body() createProductDto: CreateProductDto) {
    try {
      const product = await this.productService.create(createProductDto);
      return response.status(HttpStatus.CREATED).json({
        product,
      });
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: error.message,
        error: 'Bad Request',
      });
    }
  }

  @Get()
  /**
   * Retrieves all products from the database and sends them as a JSON response.
   *
   * @param {@Res()} response - The response object to send the result.
   * @return {Promise<void>} - A promise that resolves when the response is sent.
   */
  async findAll(@Res() response) {
    const products = await this.productService.findAll();
    return response.status(HttpStatus.OK).json({
      products,
    });
  }

  @Get(':id')
  /**
   * Finds a product by its ID and returns it. If the product is not found,
   * returns a JSON response with a "Product not found" message and a 404 status code.
   *
   * @param {string} id - The ID of the product to find.
   * @param {Response} response - The response object to send the result.
   * @return {Promise<Product | void>} - The found product if it exists, or void if it doesn't.
   */
  async findOne(@Res() response, @Param('id') id: string) {
    const product = await this.productService.findOne(id);
    // console.log(product);
    if (!product) {
      return response.status(HttpStatus.NOT_FOUND).json({});
    }

    return response.status(HttpStatus.OK).json(product);
  }

  @Put(':id')
  /**
   * Updates a product by its ID.
   *
   * @param {string} id - The ID of the product to update.
   * @param {UpdateProductDto} updateProductDto - The data to update the product with.
   * @param {Response} response - The response object to send the result.
   * @return {Promise<Product | void>} - The updated product if it exists, or void if it doesn't.
   */
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Res() response,
  ) {
    try {
      const product = await this.productService.update(id, updateProductDto);
      if (!product) {
        return response.status(HttpStatus.NOT_FOUND).json({
          message: 'Product not found',
        });
      }
      return response.status(HttpStatus.OK).json(product);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: error.message,
        error: 'Bad Request',
      });
    }
  }

  @Delete(':id')
  /**
   * Removes a product with the given ID from the database.
   *
   * @param {string} id - The ID of the product to be removed.
   * @param {Response} response - The response object to send the result.
   * @return {Promise<Product | void>} - The removed product if it exists, or void if it doesn't.
   */
  async remove(@Param('id') id: string, @Res() response) {
    try {
      const product = await this.productService.remove(id);
      if (!product) {
        return response.status(HttpStatus.NOT_FOUND).json({
          message: 'Product not found',
        });
      }
      return response.status(HttpStatus.NO_CONTENT).json({
        message: 'Product deleted successfully',
      });
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: error.message,
        error: 'Bad Request',
      });
    }
  }
}
