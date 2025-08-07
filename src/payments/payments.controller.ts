import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get payments by user ID' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPaymentsByUserId(@Param('userId') userId: string) {
    const payments = await this.paymentsService.getPaymentsByUserId(
      parseInt(userId),
    );
    return {
      statusCode: 200,
      message: 'Payments retrieved successfully',
      data: payments,
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all payments with user details' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getAllPaymentsWithUsers() {
    const payments = await this.paymentsService.getAllPaymentsWithUsers();
    return {
      statusCode: 200,
      message: 'Payments retrieved successfully',
      data: payments,
    };
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get payment statistics by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment stats retrieved successfully',
  })
  async getPaymentStatsByUserId(@Param('userId') userId: string) {
    const stats = await this.paymentsService.getPaymentStatsByUserId(
      parseInt(userId),
    );
    return {
      statusCode: 200,
      message: 'Payment stats retrieved successfully',
      data: stats,
    };
  }

  @Get(':paymentId')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentById(@Param('paymentId') paymentId: string) {
    const payment = await this.paymentsService.getPaymentById(
      parseInt(paymentId),
    );
    return {
      statusCode: 200,
      message: 'Payment retrieved successfully',
      data: payment,
    };
  }
}
