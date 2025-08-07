import { Injectable } from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { privacy } from '../db/schemas/privacySchema';
import { eq, desc } from 'drizzle-orm';
import {
  CreatePrivacyDto,
  UpdatePrivacyDto,
  PrivacyResponseDto,
} from './privacy.dto';

@Injectable()
export class PrivacyService {
  async createPrivacy(
    createPrivacyDto: CreatePrivacyDto,
  ): Promise<PrivacyResponseDto> {
    const [newPrivacy] = await db
      .insert(privacy)
      .values({
        title: createPrivacyDto.title,
        content: createPrivacyDto.content,
        status: createPrivacyDto.status || 'active',
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    return {
      id: newPrivacy.id,
      title: newPrivacy.title,
      content: newPrivacy.content,
      status: newPrivacy.status,
      created_at: newPrivacy.created_at,
      updated_at: newPrivacy.updated_at,
    };
  }

  async getAllPrivacy(): Promise<PrivacyResponseDto[]> {
    const allPrivacy = await db
      .select()
      .from(privacy)
      .orderBy(desc(privacy.created_at));

    return allPrivacy.map((privacyItem) => ({
      id: privacyItem.id,
      title: privacyItem.title,
      content: privacyItem.content,
      status: privacyItem.status,
      created_at: privacyItem.created_at,
      updated_at: privacyItem.updated_at,
    }));
  }

  async getActivePrivacy(): Promise<PrivacyResponseDto | null> {
    const [activePrivacy] = await db
      .select()
      .from(privacy)
      .where(eq(privacy.status, 'active'))
      .orderBy(desc(privacy.created_at))
      .limit(1);

    if (!activePrivacy) {
      return null;
    }

    return {
      id: activePrivacy.id,
      title: activePrivacy.title,
      content: activePrivacy.content,
      status: activePrivacy.status,
      created_at: activePrivacy.created_at,
      updated_at: activePrivacy.updated_at,
    };
  }

  async getPrivacyById(id: number): Promise<PrivacyResponseDto | null> {
    const [privacyItem] = await db
      .select()
      .from(privacy)
      .where(eq(privacy.id, id));

    if (!privacyItem) {
      return null;
    }

    return {
      id: privacyItem.id,
      title: privacyItem.title,
      content: privacyItem.content,
      status: privacyItem.status,
      created_at: privacyItem.created_at,
      updated_at: privacyItem.updated_at,
    };
  }

  async updatePrivacy(
    id: number,
    updatePrivacyDto: UpdatePrivacyDto,
  ): Promise<PrivacyResponseDto | null> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (updatePrivacyDto.title !== undefined) {
      updateData.title = updatePrivacyDto.title;
    }
    if (updatePrivacyDto.content !== undefined) {
      updateData.content = updatePrivacyDto.content;
    }
    if (updatePrivacyDto.status !== undefined) {
      updateData.status = updatePrivacyDto.status;
    }

    const [updatedPrivacy] = await db
      .update(privacy)
      .set(updateData)
      .where(eq(privacy.id, id))
      .returning();

    if (!updatedPrivacy) {
      return null;
    }

    return {
      id: updatedPrivacy.id,
      title: updatedPrivacy.title,
      content: updatedPrivacy.content,
      status: updatedPrivacy.status,
      created_at: updatedPrivacy.created_at,
      updated_at: updatedPrivacy.updated_at,
    };
  }

  async deletePrivacy(id: number): Promise<boolean> {
    const [deletedPrivacy] = await db
      .delete(privacy)
      .where(eq(privacy.id, id))
      .returning();

    if (!deletedPrivacy) {
      return false;
    }
    return true;
  }
}
