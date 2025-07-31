import { Injectable, NotFoundException, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { rewardTargets } from '../db/schemas/rewardTargetSchema';
import { eq } from 'drizzle-orm';
import { users } from '../db/schemas/userSchema';
import { and } from 'drizzle-orm';

@Injectable()
export class AdminService {
  async addRewardTarget(referralCount: number, reward: string, target:string) {
    try {
      const result = await db.insert(rewardTargets).values({ referralCount, reward, target}).returning();
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

  async getUsersByReferralCountWithReferred(referralCount: number, page = 1, pageSize = 10) {
    try {
      const offset = (page - 1) * pageSize;
      // Fetch users with the given referralCount
      const mainUsers = await db
        .select()
        .from(users)
        .where(eq(users.referralCount, referralCount))
        .offset(offset)
        .limit(pageSize);

      // For each user, fetch users they referred
      const results = await Promise.all(
        mainUsers.map(async (user) => {
          const referred = await db
            .select()
            .from(users)
            .where(eq(users.referred_by_code, user.referral_code));
          return { ...user, referredUsers: referred };
        })
      );

      return {
        statusCode: 200,
        message: 'Users with referralCount and their referred users fetched successfully',
        data: results,
        page,
        pageSize,
      };
    } catch (error) {
      throw new InternalServerErrorException(error?.message || 'Failed to fetch users by referralCount');
    }
  }

  async approveUserReward(userId: number, reward: string, status?: string) {
    try {
      let rewardValue = reward;
      if (status && status.toLowerCase() === 'approved') {
        rewardValue = 'approved';
      } else if (status && status.toLowerCase() === 'delivered') {
        // Fetch current reward value
        const userResult = await db.select().from(users).where(eq(users.id, userId));
        if (!userResult || userResult.length === 0) {
          throw new NotFoundException('User not found');
        }
        // If current reward is 'approved', replace with 'delivered'
        if (userResult[0].reward === 'approved') {
          rewardValue = 'delivered';
        } else {
          rewardValue = reward || 'delivered';
        }
      }
      const result = await db
        .update(users)
        .set({ reward: rewardValue })
        .where(eq(users.id, userId))
        .returning();
      if (!result || result.length === 0) {
        throw new NotFoundException('User not found');
      }
      return {
        statusCode: 200,
        message: 'Reward status updated for user',
        data: result[0],
      };
    } catch (error) {
      throw new InternalServerErrorException(error?.message || 'Failed to update reward status for user');
    }
  }
} 