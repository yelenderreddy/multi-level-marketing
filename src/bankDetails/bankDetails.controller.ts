import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { BankDetailsService, BankDetailsDto } from './bankDetails.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/bankDetails')
@UseGuards(JwtAuthGuard)
export class BankDetailsController {
  constructor(private readonly bankDetailsService: BankDetailsService) {}

  @Get('getBankDetails/:userId')
  async getBankDetailsWithUser(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const bankDetails = await this.bankDetailsService.getBankDetailsWithUser(userId);
      
      if (!bankDetails) {
        return {
          statusCode: 404,
          message: 'Bank details not found for this user',
          data: null,
        };
      }

      return {
        statusCode: 200,
        message: 'Bank details fetched successfully',
        data: bankDetails,
      };
    } catch (error) {
      console.error('Error in getBankDetailsWithUser controller:', error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  @Post('createOrUpdateBankDetails/:userId')
  async createOrUpdateBankDetails(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() bankDetails: BankDetailsDto,
  ) {
    try {
      const result = await this.bankDetailsService.createOrUpdateBankDetails(userId, bankDetails);
      
      return {
        statusCode: 200,
        message: 'Bank details created/updated successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error in createOrUpdateBankDetails controller:', error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: null,
      };
    }
  }
} 