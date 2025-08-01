import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  BadRequestException,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/createUsers')
  async createUser(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      mobileNumber: string;
      gender?: string;
      address?: string;
      referralCode?: string;
      referredByCode?: string;
      paymentStatus?: 'PENDING' | 'PAID';
      reward?: string;
      referralCount?: number;
    },
  ) {
    const {
      name,
      email,
      password,
      mobileNumber,
      gender,
      address,
      referralCode,
      referredByCode,
      paymentStatus,
      reward,
      referralCount,
    } = body;

    if (!name || !email || !password) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing required fields',
        data: null,
      });
    }

    return this.usersService.createUser(
      name,
      email,
      password,
      mobileNumber,
      referralCode,
      gender,
      address,
      referredByCode,
      paymentStatus,
      reward,
      referralCount,
    );
  }

  @Get('/getUserById/:id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid user ID',
        data: null,
      });
    }

    return this.usersService.getUserById(userId);
  }

  @Post('/login')
  async loginUser(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing email or password',
        data: null,
      });
    }
    return this.usersService.loginUser(email, password);
  }

  @Get('/referredBy/:referralCode')
  @UseGuards(JwtAuthGuard)
  async getUsersReferredBy(@Param('referralCode') referralCode: string) {
    return this.usersService.getUsersReferredBy(referralCode);
  }

  @Get('/referral-stats/:referralCode')
  @UseGuards(JwtAuthGuard)
  async getReferralStats(@Param('referralCode') referralCode: string) {
    return this.usersService.getReferralStats(referralCode);
  }
  @Post('/updateUser/:id')
  @UseGuards(JwtAuthGuard)
  async updateUserDetails(
    @Param('id') id: string,
    @Body()
    body: {
      address?: string;
      gender?: string;
      referral_code?: string;
      referred_by_code?: string;
      payment_status?: 'PENDING' | 'PAID';
    },
  ) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid user ID',
        data: null,
      });
    }

    return this.usersService.updateUserDetails(userId, body);
  }

  @Get('/all')
  @UseGuards(JwtAuthGuard)
  async getAllUsers(@Query('page') page = '1', @Query('limit') limit = '10') {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    return this.usersService.getAllUsers(pageNum, limitNum);
  }

  @Post('/delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid user ID',
        data: null,
      });
    }
    return this.usersService.deleteUserById(userId);
  }

  @Post('/updatePassword/:id')
  @UseGuards(JwtAuthGuard)
  async updateUserPassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
  ) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid user ID',
        data: null,
      });
    }
    const { newPassword } = body;
    return this.usersService.updateUserPassword(userId, newPassword);
  }

  @Post('/updateWalletBalance/:id')
  @UseGuards(JwtAuthGuard)
  async updateWalletBalance(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid user ID',
        data: null,
      });
    }
    return this.usersService.updateWalletBalance(userId);
  }

  @Post('/updateWalletBalanceByReferralCode/:referralCode')
  @UseGuards(JwtAuthGuard)
  async updateWalletBalanceByReferralCode(
    @Param('referralCode') referralCode: string,
  ) {
    return this.usersService.updateWalletBalanceByReferralCode(referralCode);
  }

  @Get('/walletBalance/:id')
  @UseGuards(JwtAuthGuard)
  async getWalletBalance(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid user ID',
        data: null,
      });
    }
    return this.usersService.getWalletBalance(userId);
  }
}
