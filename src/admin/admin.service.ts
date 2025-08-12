import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { rewardTargets } from '../db/schemas/rewardTargetSchema';
import { eq, gte, sql } from 'drizzle-orm';
import { users } from '../db/schemas/userSchema';

@Injectable()
export class AdminService {
  async addRewardTarget(referralCount: number, reward: string, target: string) {
    try {
      const result = await db
        .insert(rewardTargets)
        .values({ referralCount, reward, target })
        .returning();
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Reward target added successfully',
        data: result[0],
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to add reward target',
        );
      }
      throw new InternalServerErrorException('Failed to add reward target');
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
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to fetch reward targets',
        );
      }
      throw new InternalServerErrorException('Failed to fetch reward targets');
    }
  }

  async updateRewardTarget(id: number, updates: Record<string, any>) {
    try {
      if (!updates || Object.keys(updates).length === 0) {
        throw new HttpException(
          'No update fields provided',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await db
        .update(rewardTargets)
        .set(updates)
        .where(eq(rewardTargets.id, id))
        .returning();
      if (!result || result.length === 0) {
        throw new NotFoundException('Reward target not found');
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Reward target updated successfully',
        data: result[0],
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to update reward target',
        );
      }
      throw new InternalServerErrorException('Failed to update reward target');
    }
  }

  async deleteRewardTarget(id: number) {
    try {
      const result = await db
        .delete(rewardTargets)
        .where(eq(rewardTargets.id, id))
        .returning();
      if (!result || result.length === 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Reward target not found',
          data: null,
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Reward target deleted successfully',
        data: { id },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to delete reward target',
        );
      }
      throw new InternalServerErrorException('Failed to delete reward target');
    }
  }

  async getUsersByReferralCountWithReferred(
    referralCount: number,
    page = 1,
    pageSize = 10,
  ) {
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
        }),
      );

      return {
        statusCode: 200,
        message:
          'Users with referralCount and their referred users fetched successfully',
        data: results,
        page,
        pageSize,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to fetch users by referralCount',
        );
      }
      throw new InternalServerErrorException(
        'Failed to fetch users by referralCount',
      );
    }
  }

  async approveUserReward(userId: number, reward: string, status?: string) {
    try {
      let rewardValue = reward;
      if (status && status.toLowerCase() === 'approved') {
        rewardValue = 'approved';
      } else if (status && status.toLowerCase() === 'delivered') {
        // Fetch current reward value
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, userId));
        if (!userResult || userResult.length === 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'User not found',
            data: null,
          };
        }
        const user = userResult[0];
        if (!user) {
          return {
            statusCode: HttpStatus.OK,
            message: 'User not found',
            data: null,
          };
        }
        // If current reward is 'approved', replace with 'delivered'
        if (user.reward === 'approved') {
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
        return {
          statusCode: HttpStatus.OK,
          message: 'User not found',
          data: null,
        };
      }
      return {
        statusCode: 200,
        message: 'Reward status updated for user',
        data: result[0],
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to update reward status for user',
        );
      }
      throw new InternalServerErrorException(
        'Failed to update reward status for user',
      );
    }
  }

  // Dashboard Statistics Methods
  async getDashboardStats() {
    try {
      // Get total users count
      const totalUsersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      const totalUsers = totalUsersResult[0]?.count || 0;

      // Get today's joined users count (users created today)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      const todayJoinsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.created_at, today));

      const todayJoins = todayJoinsResult[0]?.count || 0;

      // Get weekly joins (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const weeklyJoinsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.created_at, weekAgo));

      const weeklyJoins = weeklyJoinsResult[0]?.count || 0;

      // Get monthly joins (last 30 days)
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      monthAgo.setHours(0, 0, 0, 0);

      const monthlyJoinsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.created_at, monthAgo));

      const monthlyJoins = monthlyJoinsResult[0]?.count || 0;

      // Get daily joins data for the last 7 days (for charts)
      const dailyJoinsData: Array<{ date: string; joins: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dailyCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(
            sql`${users.created_at} >= ${date} AND ${users.created_at} < ${nextDate}`,
          );

        dailyJoinsData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          joins: dailyCountResult[0]?.count || 0,
        });
      }

      // Get top referrer today (user with most referrals today)
      const topReferrerTodayResult = await db
        .select({
          name: users.name,
          referralCount: users.referralCount,
          referral_code: users.referral_code,
        })
        .from(users)
        .orderBy(sql`${users.referralCount} DESC`)
        .limit(1);

      const topReferrerToday =
        topReferrerTodayResult.length > 0
          ? `${topReferrerTodayResult[0].name} (${topReferrerTodayResult[0].referralCount} referrals)`
          : 'None';

      // Get users with pending rewards (reward status not 'delivered')
      const pendingRewardsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(
          sql`${users.reward} IS NOT NULL AND ${users.reward} != 'delivered'`,
        );

      const pendingRewards = pendingRewardsResult[0]?.count || 0;

      return {
        statusCode: HttpStatus.OK,
        message: 'Dashboard statistics fetched successfully',
        data: {
          totalUsers,
          todayJoins,
          weeklyJoins,
          monthlyJoins,
          dailyJoinsData,
          topReferrerToday,
          pendingRewards,
          // Additional stats can be added here
          giftPoolBalance: 0, // Placeholder - implement based on your gift pool logic
          companyProfit: 0, // Placeholder - implement based on your profit logic
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to fetch dashboard statistics',
        );
      }
      throw new InternalServerErrorException(
        'Failed to fetch dashboard statistics',
      );
    }
  }

  async getTotalUsersCount() {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      const totalUsers = result[0]?.count || 0;

      return {
        statusCode: HttpStatus.OK,
        message: 'Total users count fetched successfully',
        data: { totalUsers },
      };
    } catch (error) {
      console.error('Error fetching total users count:', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to fetch total users count',
        );
      }
      throw new InternalServerErrorException(
        'Failed to fetch total users count',
      );
    }
  }

  async getDailyJoinsCount() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.created_at, today));

      const todayJoins = result[0]?.count || 0;

      return {
        statusCode: HttpStatus.OK,
        message: 'Daily joins count fetched successfully',
        data: { todayJoins },
      };
    } catch (error) {
      console.error('Error fetching daily joins count:', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to fetch daily joins count',
        );
      }
      throw new InternalServerErrorException(
        'Failed to fetch daily joins count',
      );
    }
  }
}
