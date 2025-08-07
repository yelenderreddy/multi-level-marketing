import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post('/createFaq')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        question: { type: 'string', example: 'What is MLM?' },
        answer: {
          type: 'string',
          example: 'Multi-Level Marketing is a business model...',
        },
        category: { type: 'string', example: 'General' },
      },
      required: ['question', 'answer'],
    },
  })
  @ApiResponse({ status: 201, description: 'FAQ created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createFaq(
    @Body()
    body: {
      question: string;
      answer: string;
      category?: string;
    },
  ) {
    return this.faqService.createFaq(body);
  }

  @Get('/getAllFaqs')
  @ApiOperation({ summary: 'Get all FAQs' })
  @ApiResponse({ status: 200, description: 'FAQs retrieved successfully' })
  async getAllFaqs() {
    return this.faqService.getAllFaqs();
  }

  @Put('/updateFaq/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a FAQ' })
  @ApiParam({ name: 'id', description: 'FAQ ID', example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        question: { type: 'string', example: 'Updated question?' },
        answer: { type: 'string', example: 'Updated answer...' },
        category: { type: 'string', example: 'Updated Category' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'FAQ updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async updateFaq(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { question?: string; answer?: string; category?: string },
  ) {
    return this.faqService.updateFaq(id, body);
  }

  @Delete('/deleteFaq/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a FAQ' })
  @ApiParam({ name: 'id', description: 'FAQ ID', example: '1' })
  @ApiResponse({ status: 200, description: 'FAQ deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async deleteFaq(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.deleteFaq(id);
  }
}
