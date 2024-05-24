import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductDocument } from './schema/product.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
  ) {}
  /**
   * Creates a new product using the provided data.
   *
   * @param {CreateProductDto} createProductDto - The data for creating the product.
   * @return {Promise<Product>} The newly created product.
   */
  async create(createProductDto: CreateProductDto) {
    const newProduct = await this.productModel.create(createProductDto);
    return newProduct;
  }

  /**
   * Retrieves all products from the database.
   *
   * @return {Promise<Product[]>} A promise that resolves to an array of all products.
   */
  async findAll() {
    const allProducts = await this.productModel.find();
    return allProducts;
  }

  /**
   * Retrieves a product by its ID.
   *
   * @param {string} id - The ID of the product.
   * @return {Promise<Product>} The product with the specified ID, or null if not found.
   * @throws {NotFoundException} If the product with the specified ID is not found.
   */
  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product was not found');
    }
    return product;
  }

  async findByIds(ids: string[]): Promise<ProductDocument[]> {
    return await this.productModel.find({ _id: { $in: ids } });
  }

  async getByObjectIds(ids: ObjectId[]): Promise<ProductDocument[]> {
    return await this.productModel.find({ _id: { $in: ids } });
  }

  /**
   * Updates a product by its ID.
   *
   * @param {string} id - The ID of the product to update.
   * @param {UpdateProductDto} updateProductDto - The data to update the product with.
   * @return {Promise<Product>} - A promise that resolves to the updated product.
   * @throws {NotFoundException} - If the product with the given ID is not found.
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productModel.findByIdAndUpdate(
        id,
        updateProductDto,
      );
      return product;
    } catch (error) {
      throw new NotFoundException('Product was not found');
    }
  }

  /**
   * Removes a product from the database by its ID.
   *
   * @param {string} id - The ID of the product to be removed.
   * @return {Promise<Product | null>} The removed product, or null if the product was not found.
   * @throws {NotFoundException} If the product with the given ID is not found.
   */
  async remove(id: string) {
    try {
      const product = await this.productModel.findByIdAndDelete(id);
      return product;
    } catch (error) {
      throw new NotFoundException('Product was not found');
    }
  }
}
