import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { faqs } from '../db/schemas/faqSchema';
import { eq } from 'drizzle-orm';

@Injectable()
export class FaqService {
  async createFaq(dto: { question: string; answer: string; category?: string }) {
    try {
      const result = await db
        .insert(faqs)
        .values({
          question: dto.question,
          answer: dto.answer,
          category: dto.category,
        })
        .returning();

      return {
        statusCode: HttpStatus.CREATED,
        message: 'FAQ created successfully',
        data: result[0],
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message || 'Failed to create FAQ');
    }
  }

  async getAllFaqs() {
    try {
      const result = await db
        .select()
        .from(faqs)
        .where(eq(faqs.isActive, true));

      return {
        statusCode: HttpStatus.OK,
        message: 'FAQs fetched successfully',
        data: result,
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message || 'Failed to fetch FAQs');
    }
  }

  async updateFaq(
    id: number,
    dto: { question?: string; answer?: string; category?: string },
  ) {
    try {
      const exists = await db
        .select()
        .from(faqs)
        .where(eq(faqs.id, id))
        .limit(1);

      if (!exists || exists.length === 0) {
        throw new NotFoundException('FAQ not found');
      }

      const result = await db
        .update(faqs)
        .set({
          ...dto,
          updatedAt: new Date(),
        })
        .where(eq(faqs.id, id))
        .returning();

      return {
        statusCode: HttpStatus.OK,
        message: 'FAQ updated successfully',
        data: result[0],
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message || 'Failed to update FAQ');
    }
  }

  async deleteFaq(id: number) {
    try {
      const exists = await db
        .select()
        .from(faqs)
        .where(eq(faqs.id, id))
        .limit(1);

      if (!exists || exists.length === 0) {
        throw new NotFoundException('FAQ not found');
      }

      const result = await db
        .update(faqs)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(faqs.id, id))
        .returning();

      return {
        statusCode: HttpStatus.OK,
        message: 'FAQ deleted (soft) successfully',
        data: result[0],
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message || 'Failed to delete FAQ');
    }
  }
}
