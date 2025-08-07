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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/createUsers')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'password123' },
        mobileNumber: { type: 'string', example: '+1234567890' },
        gender: { type: 'string', example: 'Male' },
        address: { type: 'string', example: '123 Main St' },
        referralCode: { type: 'string', example: 'REF123' },
        referredByCode: { type: 'string', example: 'REF456' },
        paymentStatus: {
          type: 'string',
          enum: ['PENDING', 'PAID'],
          example: 'PENDING',
        },
        reward: { type: 'string', example: '100' },
        referralCount: { type: 'number', example: 0 },
      },
      required: ['name', 'email', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Missing required fields' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '1' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Missing email or password' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get users referred by a specific referral code' })
  @ApiParam({
    name: 'referralCode',
    description: 'Referral code',
    example: 'REF123',
  })
  @ApiResponse({
    status: 200,
    description: 'Referred users retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUsersReferredBy(@Param('referralCode') referralCode: string) {
    return this.usersService.getUsersReferredBy(referralCode);
  }

  @Get('/referral-stats/:referralCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get referral statistics for a referral code' })
  @ApiParam({
    name: 'referralCode',
    description: 'Referral code',
    example: 'REF123',
  })
  @ApiResponse({
    status: 200,
    description: 'Referral stats retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getReferralStats(@Param('referralCode') referralCode: string) {
    return this.usersService.getReferralStats(referralCode);
  }
  @Post('/updateUser/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user details' })
  @ApiParam({ name: 'id', description: 'User ID', example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        address: { type: 'string', example: '123 Main St' },
        gender: { type: 'string', example: 'Male' },
        referral_code: { type: 'string', example: 'REF123' },
        referred_by_code: { type: 'string', example: 'REF456' },
        payment_status: {
          type: 'string',
          enum: ['PENDING', 'PAID'],
          example: 'PAID',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User details updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    example: '1',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    example: '10',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllUsers(@Query('page') page = '1', @Query('limit') limit = '10') {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    return this.usersService.getAllUsers(pageNum, limitNum);
  }

  @Post('/delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID', example: '1' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user password' })
  @ApiParam({ name: 'id', description: 'User ID', example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newPassword: { type: 'string', example: 'newpassword123' },
      },
      required: ['newPassword'],
    },
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid user ID or missing password',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update wallet balance for a user' })
  @ApiParam({ name: 'id', description: 'User ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Wallet balance updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update wallet balance by referral code' })
  @ApiParam({
    name: 'referralCode',
    description: 'Referral code',
    example: 'REF123',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet balance updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateWalletBalanceByReferralCode(
    @Param('referralCode') referralCode: string,
  ) {
    return this.usersService.updateWalletBalanceByReferralCode(referralCode);
  }

  @Get('/walletBalance/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get wallet balance for a user' })
  @ApiParam({ name: 'id', description: 'User ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Wallet balance retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
