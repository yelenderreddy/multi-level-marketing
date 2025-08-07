import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { TermsService } from './terms.service';
import { CreateTermsDto, UpdateTermsDto } from './terms.dto';

@Controller('terms')
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @Post()
  async createTerms(@Body() createTermsDto: CreateTermsDto) {
    const terms = await this.termsService.createTerms(createTermsDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Terms and conditions created successfully',
      data: terms,
    };
  }

  @Get()
  async getAllTerms() {
    const terms = await this.termsService.getAllTerms();
    return {
      statusCode: HttpStatus.OK,
      message: 'Terms and conditions retrieved successfully',
      data: terms,
    };
  }

  @Get('active')
  async getActiveTerms() {
    const terms = await this.termsService.getActiveTerms();
    return {
      statusCode: HttpStatus.OK,
      message: 'Active terms and conditions retrieved successfully',
      data: terms,
    };
  }

  @Get(':id')
  async getTermsById(@Param('id') id: string) {
    const terms = await this.termsService.getTermsById(parseInt(id));
    return {
      statusCode: HttpStatus.OK,
      message: 'Terms and conditions retrieved successfully',
      data: terms,
    };
  }

  @Put(':id')
  async updateTerms(
    @Param('id') id: string,
    @Body() updateTermsDto: UpdateTermsDto,
  ) {
    const terms = await this.termsService.updateTerms(
      parseInt(id),
      updateTermsDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Terms and conditions updated successfully',
      data: terms,
    };
  }

  @Delete(':id')
  async deleteTerms(@Param('id') id: string) {
    await this.termsService.deleteTerms(parseInt(id));
    return {
      statusCode: HttpStatus.OK,
      message: 'Terms and conditions deleted successfully',
      data: null,
    };
  }
}
