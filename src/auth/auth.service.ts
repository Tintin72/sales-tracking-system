import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { User, UserDocument } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  saltRounds = 10;

  /**
   * Sign up a new user.
   *
   * @param {CreateUserDto} createUserDto - The user data to create a new user.
   * @return {Promise<UserDocument>} The newly created user document.
   * @throws {ConflictException} If a user with the same email already exists.
   * @throws {BadRequestException} If there is an error hashing the password or saving the user.
   */
  async signUp(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findOneByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      const user = await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
      });
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Sign in a user with the given email and password.
   *
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @return {Promise<string>} - A promise that resolves to a JWT token if the user is successfully signed in.
   * @throws {NotFoundException} - If the user with the given email is not found.
   * @throws {UnauthorizedException} - If the provided password is invalid.
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
