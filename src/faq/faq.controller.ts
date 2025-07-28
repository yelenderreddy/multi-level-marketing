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

@Controller('faq')
@UseGuards(JwtAuthGuard)
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post('/createFaq')
  async createFaq(
    @Body()
    body: { question: string; answer: string; category?: string },
  ) {
    return this.faqService.createFaq(body);
  }

  @Get('/getAllFaqs')
  async getAllFaqs() {
    return this.faqService.getAllFaqs();
  }

  @Put('/updateFaq/:id')
  async updateFaq(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { question?: string; answer?: string; category?: string },
  ) {
    return this.faqService.updateFaq(id, body);
  }

  @Delete('/deleteFaq/:id')
  async deleteFaq(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.deleteFaq(id);
  }
}
