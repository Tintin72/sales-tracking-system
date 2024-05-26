import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Retrieves all users from the database.
   *
   * @return {Promise<UserDocument[]>} A promise that resolves to an array of user documents.
   */
  async findAll(): Promise<UserDocument[]> {
    return await this.userModel.find();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Finds a user by their ID.
   *
   * @param {string} id - The ID of the user to find.
   * @return {Promise<UserDocument>} - A promise that resolves to the user document with the given ID.
   */
  async findOne(id: string): Promise<UserDocument> {
    return this.userModel.findById(id);
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Updates a user with the given ID using the provided data.
   *
   * @param {string} id - The ID of the user to update.
   * @param {UpdateUserDto} updateUserDto - The data to update the user with.
   * @return {Promise<UserDocument>} - A promise that resolves to the updated user document.
   * @throws {NotFoundException} - If the user with the given ID is not found.
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      {
        new: true,
      },
    );
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  /**
   * Removes a user with the given ID from the database.
   *
   * @param {string} id - The ID of the user to remove.
   * @return {Promise<UserDocument | null>} - A promise that resolves to the removed user document,
   * @throws {NotFoundException} - If the user with the given ID is not found.
   *
   */
  async remove(id: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
