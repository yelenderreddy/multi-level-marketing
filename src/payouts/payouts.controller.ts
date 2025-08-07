import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PayoutsService } from './payouts.service';
import { CreatePayoutDto, UpdatePayoutDto } from './payouts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('payouts')
@Controller('payouts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payout' })
  @ApiResponse({ status: 201, description: 'Payout created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async createPayout(@Body() createPayoutDto: CreatePayoutDto) {
    const payout = await this.payoutsService.createPayout(createPayoutDto);
    return {
      statusCode: 201,
      message: 'Payout created successfully',
      data: payout,
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get payouts by user ID' })
  @ApiResponse({ status: 200, description: 'Payouts retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPayoutsByUserId(@Param('userId') userId: string) {
    const payouts = await this.payoutsService.getPayoutsByUserId(
      parseInt(userId),
    );
    return {
      statusCode: 200,
      message: 'Payouts retrieved successfully',
      data: payouts,
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all payouts with user details' })
  @ApiResponse({ status: 200, description: 'Payouts retrieved successfully' })
  async getAllPayoutsWithUsers() {
    const payouts = await this.payoutsService.getAllPayoutsWithUsers();
    return {
      statusCode: 200,
      message: 'Payouts retrieved successfully',
      data: payouts,
    };
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get payout statistics by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Payout stats retrieved successfully',
  })
  async getPayoutStatsByUserId(@Param('userId') userId: string) {
    const stats = await this.payoutsService.getPayoutStatsByUserId(
      parseInt(userId),
    );
    return {
      statusCode: 200,
      message: 'Payout stats retrieved successfully',
      data: stats,
    };
  }

  @Get(':payoutId')
  @ApiOperation({ summary: 'Get payout by ID' })
  @ApiResponse({ status: 200, description: 'Payout retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payout not found' })
  async getPayoutById(@Param('payoutId') payoutId: string) {
    const payout = await this.payoutsService.getPayoutById(payoutId);
    return {
      statusCode: 200,
      message: 'Payout retrieved successfully',
      data: payout,
    };
  }

  @Put(':payoutId/status')
  @ApiOperation({ summary: 'Update payout status' })
  @ApiResponse({
    status: 200,
    description: 'Payout status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Payout not found' })
  async updatePayoutStatus(
    @Param('payoutId') payoutId: string,
    @Body() updatePayoutDto: UpdatePayoutDto,
  ) {
    const payout = await this.payoutsService.updatePayoutStatus(
      payoutId,
      updatePayoutDto,
    );
    return {
      statusCode: 200,
      message: 'Payout status updated successfully',
      data: payout,
    };
  }
}
