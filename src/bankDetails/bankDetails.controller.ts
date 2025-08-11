import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { BankDetailsService } from './bankDetails.service';
import { CreateBankDetailsDto, UpdateBankDetailsDto } from './bankDetails.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Bank Details')
@Controller('api/bankDetails')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BankDetailsController {
  constructor(private readonly bankDetailsService: BankDetailsService) {}

  @Get('getBankDetails/:userId')
  @ApiOperation({ summary: 'Get bank details for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Bank details fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Bank details not found for this user',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getBankDetailsWithUser(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const bankDetails =
        await this.bankDetailsService.getBankDetailsWithUser(userId);

      if (!bankDetails) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Bank details not found for this user',
          data: null,
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Bank details fetched successfully',
        data: bankDetails,
      };
    } catch (error) {
      console.error('Error in getBankDetailsWithUser controller:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  @Post('createBankDetails/:userId')
  @ApiOperation({ summary: 'Create bank details for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bankName: { type: 'string', example: 'HDFC Bank' },
        accountNumber: { type: 'string', example: '1234567890' },
        ifscCode: { type: 'string', example: 'HDFC0001234' },
        accountHolderName: { type: 'string', example: 'John Doe' },
      },
      required: ['bankName', 'accountNumber', 'ifscCode', 'accountHolderName'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Bank details created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({
    status: 409,
    description: 'Bank details already exist for this user',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createBankDetails(
    @Param('userId', ParseIntPipe) userId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    bankDetails: CreateBankDetailsDto,
  ) {
    try {
      const result = await this.bankDetailsService.createBankDetails(
        userId,
        bankDetails,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Bank details created successfully',
        data: result,
        response: 'pending',
      };
    } catch (error) {
      console.error('Error in createBankDetails controller:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  @Put('updateBankDetails/:userId')
  @ApiOperation({ summary: 'Update bank details for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bankName: { type: 'string', example: 'HDFC Bank' },
        accountNumber: { type: 'string', example: '1234567890' },
        ifscCode: { type: 'string', example: 'HDFC0001234' },
        accountHolderName: { type: 'string', example: 'John Doe' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bank details updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({
    status: 404,
    description: 'Bank details not found for this user',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateBankDetails(
    @Param('userId', ParseIntPipe) userId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    bankDetails: UpdateBankDetailsDto,
  ) {
    try {
      const result = await this.bankDetailsService.updateBankDetails(
        userId,
        bankDetails,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Bank details updated successfully',
        data: result,
        response: 'pending',
      };
    } catch (error) {
      console.error('Error in updateBankDetails controller:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  @Post('createOrUpdateBankDetails/:userId')
  @ApiOperation({ summary: 'Create or update bank details for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bankName: { type: 'string', example: 'HDFC Bank' },
        accountNumber: { type: 'string', example: '1234567890' },
        ifscCode: { type: 'string', example: 'HDFC0001234' },
        accountHolderName: { type: 'string', example: 'John Doe' },
      },
      required: ['bankName', 'accountNumber', 'ifscCode', 'accountHolderName'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bank details created/updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createOrUpdateBankDetails(
    @Param('userId', ParseIntPipe) userId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    bankDetails: CreateBankDetailsDto,
  ) {
    try {
      const result = await this.bankDetailsService.createOrUpdateBankDetails(
        userId,
        bankDetails,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Bank details created/updated successfully',
        data: result,
        response: 'pending',
      };
    } catch (error) {
      console.error('Error in createOrUpdateBankDetails controller:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  @Delete('deleteBankDetails/:userId')
  @ApiOperation({ summary: 'Delete bank details for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Bank details deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Bank details not found for this user',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteBankDetails(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const result = await this.bankDetailsService.deleteBankDetails(userId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Bank details deleted successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error in deleteBankDetails controller:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  @Get('checkBankDetails/:userId')
  @ApiOperation({ summary: 'Check if bank details exist for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Bank details check completed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async checkBankDetails(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const hasBankDetails =
        await this.bankDetailsService.checkBankDetailsExist(userId);

      return {
        statusCode: HttpStatus.OK,
        message: hasBankDetails
          ? 'Bank details found'
          : 'No bank details found',
        data: {
          hasBankDetails,
        },
      };
    } catch (error) {
      console.error('Error in checkBankDetails controller:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  @Post('validateBankDetails')
  @ApiOperation({ summary: 'Validate bank details format' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bankName: { type: 'string', example: 'HDFC Bank' },
        accountNumber: { type: 'string', example: '1234567890' },
        ifscCode: { type: 'string', example: 'HDFC0001234' },
        accountHolderName: { type: 'string', example: 'John Doe' },
      },
      required: ['bankName', 'accountNumber', 'ifscCode', 'accountHolderName'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bank details validation completed',
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  validateBankDetails(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    bankDetails: CreateBankDetailsDto,
  ) {
    try {
      const validation =
        this.bankDetailsService.validateBankDetails(bankDetails);

      return {
        statusCode: HttpStatus.OK,
        message: validation.isValid
          ? 'Bank details are valid'
          : 'Bank details validation failed',
        data: validation,
      };
    } catch (error) {
      console.error('Error in validateBankDetails controller:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  @Get('getAllBankDetailsWithUsers')
  @ApiOperation({
    summary: 'Get all bank details with user information and status',
  })
  @ApiResponse({
    status: 200,
    description: 'All bank details with users fetched successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllBankDetailsWithUsers() {
    try {
      const bankDetails =
        await this.bankDetailsService.getAllBankDetailsWithUsers();

      return {
        statusCode: HttpStatus.OK,
        message: 'All bank details with users fetched successfully',
        data: bankDetails,
      };
    } catch (error) {
      console.error('Error in getAllBankDetailsWithUsers controller:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  @Put('updateRedeemStatus/:userId')
  @ApiOperation({ summary: 'Update redeem status for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['processing', 'deposited'],
          example: 'deposited',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Redeem status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Bank details not found for this user',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateRedeemStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('status') status: 'processing' | 'deposited',
  ) {
    try {
      const result = await this.bankDetailsService.updateRedeemStatus(
        userId,
        status,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Redeem status updated successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error in updateRedeemStatus controller:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  @Put('updateRedeemAmount/:userId')
  @ApiOperation({ summary: 'Update redeem amount for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        redeemAmount: {
          type: 'number',
          minimum: 250,
          example: 500,
        },
      },
      required: ['redeemAmount'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Redeem amount updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid redeem amount' })
  @ApiResponse({
    status: 404,
    description: 'Bank details not found for this user',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateRedeemAmount(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('redeemAmount') redeemAmount: number,
  ) {
    try {
      const result = await this.bankDetailsService.updateRedeemAmount(
        userId,
        redeemAmount,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Redeem amount updated successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error in updateRedeemAmount controller:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  @Get('redeemHistory/:userId')
  @ApiOperation({ summary: 'Get redeem history for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Redeem history fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRedeemHistory(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const result = await this.bankDetailsService.getRedeemHistory(userId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Redeem history fetched successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error in getRedeemHistory controller:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        data: null,
      };
    }
  }
}
