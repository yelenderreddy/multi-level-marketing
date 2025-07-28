import { Injectable, NotFoundException, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { rewardTargets } from '../db/schemas/rewardTargetSchema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AdminService {
  async addRewardTarget(referralCount: number, reward: string) {
    try {
      const result = await db.insert(rewardTargets).values({ referralCount, reward }).returning();
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Reward target added successfully',
        data: result[0],
      };
    } catch (error) {
      throw new InternalServerErrorException(error?.message || 'Failed to add reward target');
    }
  }

  async getAllRewardTargets() {
    try {
      const result = await db.select().from(rewardTargets);
      return {
        statusCode: HttpStatus.OK,
        message: 'Reward targets fetched successfully',
        data: result,
      };
    } catch (error) {
      throw new InternalServerErrorException(error?.message || 'Failed to fetch reward targets');
    }
  }

  async updateRewardTarget(id: number, updates: Record<string, any>) {
    try {
      if (!updates || Object.keys(updates).length === 0) {
        throw new HttpException('No update fields provided', HttpStatus.BAD_REQUEST);
      }
      const result = await db.update(rewardTargets).set(updates).where(eq(rewardTargets.id, id)).returning();
      if (!result || result.length === 0) {
        throw new NotFoundException('Reward target not found');
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Reward target updated successfully',
        data: result[0],
      };
    } catch (error) {
      throw new InternalServerErrorException(error?.message || 'Failed to update reward target');
    }
  }

  async deleteRewardTarget(id: number) {
    try {
      const result = await db.delete(rewardTargets).where(eq(rewardTargets.id, id)).returning();
      if (!result || result.length === 0) {
        throw new NotFoundException('Reward target not found');
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Reward target deleted successfully',
        data: { id },
      };
    } catch (error) {
      throw new InternalServerErrorException(error?.message || 'Failed to delete reward target');
    }
  }
} 