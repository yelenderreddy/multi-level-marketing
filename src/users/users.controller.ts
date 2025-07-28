import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  BadRequestException,
  HttpStatus,
  UseGuards,
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
    },
  ) {
    const { name, email, password, mobileNumber,gender,address, referralCode } = body;

    if (!name || !email || !password) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing required fields',
        data: null,
      });
    }

    return this.usersService.createUser(name, email, password, mobileNumber, gender, address, referralCode);
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
  async loginUser(
    @Body() body: { email: string; password: string },
  ) {
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

}
