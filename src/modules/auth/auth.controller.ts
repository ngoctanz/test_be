import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '~/guard/local-auth.guard';
import { JwtAuthGuard } from '~/guard/jwt-auth.guard';
import { RegisterDto } from '~/dto/register.dto';
import { ResponseData } from '~/global/ResponseData';
import express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const result = await this.authService.register(registerDto, response);
    return new ResponseData(HttpStatus.OK, result.message, null);
  }
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(
    @Req() req: express.Request & { user: any },
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const result = await this.authService.login(req.user, response);
    return new ResponseData(HttpStatus.OK, result.message, null);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Req() req: express.Request & { user: any }) {
    const userId = req.user.userId;
    const user = await this.authService.getUserById(userId);
    if (!user) {
      return new ResponseData(HttpStatus.NOT_FOUND, 'User not found', null);
    }
    const profileData = {
      userId: user.userId,
      email: user.email,
      money: user.money,
      role: user.role,
    };
    return new ResponseData(
      HttpStatus.OK,
      'Profile retrieved successfully',
      profileData,
    );
  }

  @Post('/refresh')
  async refreshToken(
    @Req() req: express.Request,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    const result = await this.authService.refreshAccessToken(
      refreshToken,
      response,
    );
    return new ResponseData(HttpStatus.OK, result.message, null);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logout(
    @Req() req: express.Request & { user: any },
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const result = await this.authService.logout(req.user.userId, response);
    return new ResponseData(HttpStatus.OK, result.message, null);
  }
}
