import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { payouts, users } from '../db/schemas';
import { eq, desc } from 'drizzle-orm';
import {
  CreatePayoutDto,
  UpdatePayoutDto,
  PayoutResponseDto,
} from './payouts.dto';

// Type for database query results
type PayoutQueryResult = {
  id: number;
  userId: number;
  payoutId: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  description: string;
  bankDetails: string;
  transactionId?: string | null;
  date: Date;
  created_at: Date;
  updated_at: Date;
};

type PayoutStatsQueryResult = {
  status: 'pending' | 'completed' | 'failed' | 'processing';
  amount: number;
};

@Injectable()
export class PayoutsService {
  async createPayout(
    createPayoutDto: CreatePayoutDto,
  ): Promise<PayoutResponseDto> {
    try {
      // Check if user exists
      const userExists = (await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, createPayoutDto.userId))) as { id: number }[];

      if (userExists.length === 0) {
        throw new NotFoundException('User not found');
      }

      const user = userExists[0];
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if payout ID already exists
      const existingPayout = (await db
        .select({ id: payouts.id })
        .from(payouts)
        .where(eq(payouts.payoutId, createPayoutDto.payoutId))) as {
        id: number;
      }[];

      if (existingPayout.length > 0) {
        throw new BadRequestException('Payout ID already exists');
      }

      // Create new payout
      const result = await db
        .insert(payouts)
        .values({
          userId: createPayoutDto.userId,
          payoutId: createPayoutDto.payoutId,
          amount: createPayoutDto.amount,
          method: createPayoutDto.method,
          status: createPayoutDto.status || 'pending',
          description: createPayoutDto.description,
          bankDetails: createPayoutDto.bankDetails,
          transactionId: createPayoutDto.transactionId,
        })
        .returning();

      const newPayout = result[0];
      if (!newPayout) {
        throw new Error('Failed to create payout');
      }

      return this.mapToResponseDto(newPayout);
    } catch (error) {
      console.error('Error creating payout:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('Failed to create payout');
    }
  }

  async getPayoutsByUserId(userId: number): Promise<PayoutResponseDto[]> {
    try {
      const result = (await db
        .select({
          id: payouts.id,
          userId: payouts.userId,
          payoutId: payouts.payoutId,
          amount: payouts.amount,
          method: payouts.method,
          status: payouts.status,
          description: payouts.description,
          bankDetails: payouts.bankDetails,
          transactionId: payouts.transactionId,
          date: payouts.date,
          created_at: payouts.created_at,
          updated_at: payouts.updated_at,
        })
        .from(payouts)
        .where(eq(payouts.userId, userId))
        .orderBy(desc(payouts.created_at))) as PayoutQueryResult[];

      return result.map((payout) => this.mapToResponseDto(payout));
    } catch (error) {
      console.error('Error fetching payouts by user ID:', error);
      throw new Error('Failed to fetch payouts');
    }
  }

  async getAllPayoutsWithUsers(): Promise<PayoutResponseDto[]> {
    try {
      const result = (await db
        .select({
          id: payouts.id,
          userId: payouts.userId,
          payoutId: payouts.payoutId,
          amount: payouts.amount,
          method: payouts.method,
          status: payouts.status,
          description: payouts.description,
          bankDetails: payouts.bankDetails,
          transactionId: payouts.transactionId,
          date: payouts.date,
          created_at: payouts.created_at,
          updated_at: payouts.updated_at,
        })
        .from(payouts)
        .orderBy(desc(payouts.created_at))) as PayoutQueryResult[];

      return result.map((payout) => this.mapToResponseDto(payout));
    } catch (error) {
      console.error('Error fetching all payouts with users:', error);
      throw new Error('Failed to fetch payouts');
    }
  }

  async updatePayoutStatus(
    payoutId: string,
    updatePayoutDto: UpdatePayoutDto,
  ): Promise<PayoutResponseDto | null> {
    try {
      const result = (await db
        .update(payouts)
        .set({
          status: updatePayoutDto.status,
          description: updatePayoutDto.description,
          transactionId: updatePayoutDto.transactionId,
          updated_at: new Date(),
        })
        .where(eq(payouts.payoutId, payoutId))
        .returning()) as PayoutQueryResult[];

      if (result.length === 0) {
        return null;
      }

      const updatedPayout = result[0];
      if (!updatedPayout) {
        return null;
      }

      return this.mapToResponseDto(updatedPayout);
    } catch (error) {
      console.error('Error updating payout status:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to update payout status');
    }
  }

  async getPayoutById(payoutId: string): Promise<PayoutResponseDto | null> {
    try {
      const result = (await db
        .select()
        .from(payouts)
        .where(eq(payouts.payoutId, payoutId))) as PayoutQueryResult[];

      if (result.length === 0) {
        return null;
      }

      const payout = result[0];
      if (!payout) {
        return null;
      }

      return this.mapToResponseDto(payout);
    } catch (error) {
      console.error('Error fetching payout by ID:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to fetch payout');
    }
  }

  async getPayoutStatsByUserId(userId: number): Promise<{
    totalPayouts: number;
    totalAmount: number;
    pendingAmount: number;
    completedAmount: number;
    processingAmount: number;
    failedAmount: number;
  }> {
    try {
      const result = (await db
        .select({
          status: payouts.status,
          amount: payouts.amount,
        })
        .from(payouts)
        .where(eq(payouts.userId, userId))) as PayoutStatsQueryResult[];

      const stats = {
        totalPayouts: result.length,
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0,
        processingAmount: 0,
        failedAmount: 0,
      };

      result.forEach((payout) => {
        const amount = payout.amount || 0;
        stats.totalAmount += amount;
        switch (payout.status) {
          case 'pending':
            stats.pendingAmount += amount;
            break;
          case 'completed':
            stats.completedAmount += amount;
            break;
          case 'processing':
            stats.processingAmount += amount;
            break;
          case 'failed':
            stats.failedAmount += amount;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching payout stats:', error);
      throw new Error('Failed to fetch payout stats');
    }
  }

  private mapToResponseDto(payout: {
    id: number;
    userId: number;
    payoutId: string;
    amount: number;
    method: string;
    status: 'pending' | 'completed' | 'failed' | 'processing';
    description: string;
    bankDetails: string;
    transactionId?: string | null;
    date: Date;
    created_at: Date;
    updated_at: Date;
  }): PayoutResponseDto {
    return {
      id: payout.id,
      userId: payout.userId,
      payoutId: payout.payoutId,
      amount: payout.amount,
      method: payout.method,
      status: payout.status,
      description: payout.description,
      bankDetails: payout.bankDetails,
      transactionId: payout.transactionId || undefined,
      date: payout.date,
      created_at: payout.created_at,
      updated_at: payout.updated_at,
    };
  }
}
