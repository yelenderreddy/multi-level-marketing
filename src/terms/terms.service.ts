import { Injectable } from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { terms } from '../db/schemas/termsSchema';
import { eq, desc } from 'drizzle-orm';
import { CreateTermsDto, UpdateTermsDto, TermsResponseDto } from './terms.dto';

@Injectable()
export class TermsService {
  async createTerms(createTermsDto: CreateTermsDto): Promise<TermsResponseDto> {
    const [newTerms] = await db
      .insert(terms)
      .values({
        title: createTermsDto.title,
        content: createTermsDto.content,
        status: createTermsDto.status || 'active',
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    return {
      id: newTerms.id,
      title: newTerms.title,
      content: newTerms.content,
      status: newTerms.status,
      created_at: newTerms.created_at,
      updated_at: newTerms.updated_at,
    };
  }

  async getAllTerms(): Promise<TermsResponseDto[]> {
    const allTerms = await db
      .select()
      .from(terms)
      .orderBy(desc(terms.created_at));

    return allTerms.map((term) => ({
      id: term.id,
      title: term.title,
      content: term.content,
      status: term.status,
      created_at: term.created_at,
      updated_at: term.updated_at,
    }));
  }

  async getActiveTerms(): Promise<TermsResponseDto | null> {
    const [activeTerms] = await db
      .select()
      .from(terms)
      .where(eq(terms.status, 'active'))
      .orderBy(desc(terms.created_at))
      .limit(1);

    if (!activeTerms) {
      return null;
    }

    return {
      id: activeTerms.id,
      title: activeTerms.title,
      content: activeTerms.content,
      status: activeTerms.status,
      created_at: activeTerms.created_at,
      updated_at: activeTerms.updated_at,
    };
  }

  async getTermsById(id: number): Promise<TermsResponseDto | null> {
    const [term] = await db.select().from(terms).where(eq(terms.id, id));

    if (!term) {
      return null;
    }

    return {
      id: term.id,
      title: term.title,
      content: term.content,
      status: term.status,
      created_at: term.created_at,
      updated_at: term.updated_at,
    };
  }

  async updateTerms(
    id: number,
    updateTermsDto: UpdateTermsDto,
  ): Promise<TermsResponseDto | null> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (updateTermsDto.title !== undefined) {
      updateData.title = updateTermsDto.title;
    }
    if (updateTermsDto.content !== undefined) {
      updateData.content = updateTermsDto.content;
    }
    if (updateTermsDto.status !== undefined) {
      updateData.status = updateTermsDto.status;
    }

    const [updatedTerms] = await db
      .update(terms)
      .set(updateData)
      .where(eq(terms.id, id))
      .returning();

    if (!updatedTerms) {
      return null;
    }

    return {
      id: updatedTerms.id,
      title: updatedTerms.title,
      content: updatedTerms.content,
      status: updatedTerms.status,
      created_at: updatedTerms.created_at,
      updated_at: updatedTerms.updated_at,
    };
  }

  async deleteTerms(id: number): Promise<boolean> {
    const [deletedTerms] = await db
      .delete(terms)
      .where(eq(terms.id, id))
      .returning();

    if (!deletedTerms) {
      return false;
    }
    return true;
  }
}
