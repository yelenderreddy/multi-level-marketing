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
  ValidationPipe
} from '@nestjs/common';
import { BankDetailsService, BankDetailsDto } from './bankDetails.service';
import { CreateBankDetailsDto, UpdateBankDetailsDto } from './bankDetails.dto';
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
  async createBankDetails(
    @Param('userId', ParseIntPipe) userId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) bankDetails: CreateBankDetailsDto,
  ) {
    try {
      const result = await this.bankDetailsService.createBankDetails(userId, bankDetails);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Bank details created successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error in createBankDetails controller:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
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
  async updateBankDetails(
    @Param('userId', ParseIntPipe) userId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) bankDetails: UpdateBankDetailsDto,
  ) {
    try {
      const result = await this.bankDetailsService.updateBankDetails(userId, bankDetails);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Bank details updated successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error in updateBankDetails controller:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
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
  async createOrUpdateBankDetails(
    @Param('userId', ParseIntPipe) userId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) bankDetails: CreateBankDetailsDto,
  ) {
    try {
      const result = await this.bankDetailsService.createOrUpdateBankDetails(userId, bankDetails);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Bank details created/updated successfully',
        data: result,
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
  async checkBankDetails(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const hasBankDetails = await this.bankDetailsService.checkBankDetailsExist(userId);
      
      return {
        statusCode: HttpStatus.OK,
        message: hasBankDetails ? 'Bank details found' : 'No bank details found',
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
  async validateBankDetails(@Body(new ValidationPipe({ transform: true, whitelist: true })) bankDetails: CreateBankDetailsDto) {
    try {
      const validation = await this.bankDetailsService.validateBankDetails(bankDetails);
      
      return {
        statusCode: HttpStatus.OK,
        message: validation.isValid ? 'Bank details are valid' : 'Bank details validation failed',
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
} 