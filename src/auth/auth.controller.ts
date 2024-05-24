import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/user/schema/user.schema';
import { Request } from 'express';
import MongooseClassSerializerInterceptor from 'src/utils/mongooseClassSerializer.interceptor';
import { JwtAuthGuard } from './jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Post('log-out')
  @HttpCode(200)
  async logOut(@Req() request: Request) {
    request.res?.setHeader(
      'Set-Cookie',
      await this.authService.getCookieForLogOut(),
    );
  }
}
