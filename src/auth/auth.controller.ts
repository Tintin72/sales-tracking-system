import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/user/schema/user.schema';
import MongooseClassSerializerInterceptor from 'src/utils/mongooseClassSerializer.interceptor';

@UseInterceptors(MongooseClassSerializerInterceptor(User))
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data, @Req() req) {
    return this.authService.signIn(data.email, data.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() data) {
    return this.authService.signUp(data);
  }
}
