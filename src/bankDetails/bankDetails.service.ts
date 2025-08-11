import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { userBankDetails, users, redeemHistory, payouts } from '../db/schemas';
import { eq, and } from 'drizzle-orm';

export interface BankDetailsDto {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  redeemAmount?: number;
  redeemStatus?: 'processing' | 'deposited';
}

export interface BankDetailsWithUser {
  id: number;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  redeemAmount: number;
  redeemStatus: 'processing' | 'deposited';
  created_at: Date;
  updated_at: Date;
  user: {
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    referral_code: string;
    referralCount: number;
    wallet_balance: number;
    payment_status: string;
    created_at: Date;
    updated_at: Date;
  };
}

// Type for database query result
type BankDetailsWithUserQueryResult = {
  id: number;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  redeemAmount: number | null;
  redeemStatus: 'processing' | 'deposited';
  created_at: Date;
  updated_at: Date;
  user: {
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    referral_code: string;
    referralCount: number;
    wallet_balance: number;
    payment_status: string;
    created_at: Date;
    updated_at: Date;
  };
};

// Type for user query result
type UserQueryResult = {
  wallet_balance: number;
  referralCount: number;
  referralCountAtLastRedeem: number;
};

// Type for redeem history query result
type RedeemHistoryQueryResult = {
  total: number;
};

// Type for redeem history item
type RedeemHistoryItem = {
  id: number;
  redeemAmount: number;
  status: string;
  bankDetails: string | null;
  redeemedAt: Date;
  depositedAt: Date | null;
};

// Type for latest processing record query result
type LatestProcessingRecordQueryResult = {
  id: number;
  redeemAmount: number;
  bankDetails: string | null;
};

// Type for bank details query result
type BankDetailsQueryResult = {
  id: number;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  redeemAmount: number | null;
  redeemStatus: 'processing' | 'deposited';
  created_at: Date;
  updated_at: Date;
};

// Type for user existence check
type UserExistenceCheck = {
  id: number;
};

@Injectable()
export class BankDetailsService {
  async getBankDetailsWithUser(
    userId: number,
  ): Promise<BankDetailsWithUser | null> {
    try {
      const result = (await db
        .select({
          id: userBankDetails.id,
          accountNumber: userBankDetails.accountNumber,
          ifscCode: userBankDetails.ifscCode,
          bankName: userBankDetails.bankName,
          accountHolderName: userBankDetails.accountHolderName,
          redeemAmount: userBankDetails.redeemAmount,
          redeemStatus: userBankDetails.redeemStatus,
          created_at: userBankDetails.created_at,
          updated_at: userBankDetails.updated_at,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
            mobileNumber: users.mobileNumber,
            referral_code: users.referral_code,
            referralCount: users.referralCount,
            wallet_balance: users.wallet_balance,
            payment_status: users.payment_status,
            created_at: users.created_at,
            updated_at: users.updated_at,
          },
        })
        .from(userBankDetails)
        .innerJoin(users, eq(userBankDetails.userId, users.id))
        .where(
          eq(userBankDetails.userId, userId),
        )) as BankDetailsWithUserQueryResult[];

      if (result.length === 0) {
        return null;
      }

      const firstResult: BankDetailsWithUserQueryResult = result[0];
      if (!firstResult) {
        return null;
      }

      return {
        id: firstResult.id,
        accountNumber: firstResult.accountNumber,
        ifscCode: firstResult.ifscCode,
        bankName: firstResult.bankName,
        accountHolderName: firstResult.accountHolderName,
        redeemAmount: firstResult.redeemAmount ?? 0,
        redeemStatus: firstResult.redeemStatus ?? 'processing',
        created_at: firstResult.created_at,
        updated_at: firstResult.updated_at,
        user: {
          id: firstResult.user.id,
          name: firstResult.user.name,
          email: firstResult.user.email,
          mobileNumber: firstResult.user.mobileNumber,
          referral_code: firstResult.user.referral_code,
          referralCount: firstResult.user.referralCount,
          wallet_balance: firstResult.user.wallet_balance,
          payment_status: firstResult.user.payment_status,
          created_at: firstResult.user.created_at,
          updated_at: firstResult.user.updated_at,
        },
      };
    } catch (error) {
      console.error('Error fetching bank details with user:', error);
      throw new Error('Failed to fetch bank details');
    }
  }

  async createBankDetails(
    userId: number,
    bankDetails: BankDetailsDto,
  ): Promise<BankDetailsWithUser> {
    try {
      // Check if user exists
      const userExists = (await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))) as UserExistenceCheck[];

      if (userExists.length === 0) {
        throw new NotFoundException('User not found');
      }

      const user = userExists[0];
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if bank details already exist for this user
      const existingBankDetails: BankDetailsQueryResult[] = await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId));

      if (existingBankDetails.length > 0) {
        throw new BadRequestException(
          'Bank details already exist for this user. Use update instead.',
        );
      }

      // Create new bank details
      await db.insert(userBankDetails).values({
        userId,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
        accountHolderName: bankDetails.accountHolderName,
      });

      // Return the created bank details with user information
      const result = await this.getBankDetailsWithUser(userId);
      if (!result) {
        throw new Error('Failed to retrieve created bank details');
      }
      return result;
    } catch (error) {
      console.error('Error creating bank details:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('Failed to create bank details');
    }
  }

  async updateBankDetails(
    userId: number,
    bankDetails: BankDetailsDto,
  ): Promise<BankDetailsWithUser | null> {
    try {
      // Check if bank details exist for this user
      const existingBankDetails = (await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId))) as BankDetailsQueryResult[];

      if (existingBankDetails.length === 0) {
        return null;
      }

      // Update existing bank details
      await db
        .update(userBankDetails)
        .set({
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
          bankName: bankDetails.bankName,
          accountHolderName: bankDetails.accountHolderName,
          updated_at: new Date(),
        })
        .where(eq(userBankDetails.userId, userId));

      // Return the updated bank details with user information
      const result = await this.getBankDetailsWithUser(userId);
      if (!result) {
        throw new Error('Failed to retrieve updated bank details');
      }
      return result;
    } catch (error) {
      console.error('Error updating bank details:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to update bank details');
    }
  }

  async createOrUpdateBankDetails(
    userId: number,
    bankDetails: BankDetailsDto,
  ): Promise<BankDetailsWithUser> {
    try {
      // Validate redeem amount if provided
      if (
        bankDetails.redeemAmount !== undefined &&
        bankDetails.redeemAmount > 0
      ) {
        // Get current user data to validate redeem amount
        const currentUser = (await db
          .select({
            wallet_balance: users.wallet_balance,
            referralCount: users.referralCount,
            referralCountAtLastRedeem: users.referralCountAtLastRedeem,
          })
          .from(users)
          .where(eq(users.id, userId))) as UserQueryResult[];

        if (currentUser.length === 0) {
          throw new NotFoundException('User not found');
        }

        const user = currentUser[0];
        if (!user) {
          throw new NotFoundException('User not found');
        }

        const currentReferralCount = user.referralCount ?? 0;

        // Calculate total earned amount (referrals * 250)
        const totalEarnedAmount = currentReferralCount * 250;

        // Get total already redeemed amount
        const totalRedeemed = (await db
          .select({ total: redeemHistory.redeemAmount })
          .from(redeemHistory)
          .where(
            eq(redeemHistory.userId, userId),
          )) as RedeemHistoryQueryResult[];

        const totalAlreadyRedeemed = totalRedeemed.reduce(
          (sum, item: RedeemHistoryQueryResult) => sum + (item.total ?? 0),
          0,
        );

        // Calculate maximum redeemable amount
        const maxRedeemableAmount = totalEarnedAmount - totalAlreadyRedeemed;

        console.log('Total earned amount:', totalEarnedAmount);
        console.log('Total already redeemed:', totalAlreadyRedeemed);
        console.log('Max redeemable amount:', maxRedeemableAmount);
        console.log('Requested redeem amount:', bankDetails.redeemAmount);

        // Validate that user is not trying to redeem more than they've earned
        if (bankDetails.redeemAmount > maxRedeemableAmount) {
          throw new BadRequestException(
            `You can only redeem up to ₹${maxRedeemableAmount}. You have earned ₹${totalEarnedAmount} total and already redeemed ₹${totalAlreadyRedeemed}.`,
          );
        }

        // Validate minimum redeem amount
        if (bankDetails.redeemAmount < 250) {
          throw new BadRequestException('Minimum redeem amount is ₹250');
        }
      }

      // Check if bank details already exist for this user
      const existingBankDetails = (await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId))) as BankDetailsQueryResult[];

      if (existingBankDetails.length > 0) {
        // Update existing bank details
        const existing = existingBankDetails[0];
        if (!existing) {
          throw new Error('Failed to retrieve existing bank details');
        }

        await db
          .update(userBankDetails)
          .set({
            accountNumber: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode,
            bankName: bankDetails.bankName,
            accountHolderName: bankDetails.accountHolderName,
            ...(bankDetails.redeemAmount !== undefined && {
              redeemAmount: bankDetails.redeemAmount,
            }),
            ...(bankDetails.redeemStatus !== undefined && {
              redeemStatus: bankDetails.redeemStatus,
            }),
            updated_at: new Date(),
          })
          .where(eq(userBankDetails.userId, userId));
      } else {
        // Create new bank details
        await db.insert(userBankDetails).values({
          userId,
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
          bankName: bankDetails.bankName,
          accountHolderName: bankDetails.accountHolderName,
          ...(bankDetails.redeemAmount !== undefined && {
            redeemAmount: bankDetails.redeemAmount,
          }),
          ...(bankDetails.redeemStatus !== undefined && {
            redeemStatus: bankDetails.redeemStatus,
          }),
        });
      }

      // Return the bank details with user information
      const result = await this.getBankDetailsWithUser(userId);
      if (!result) {
        throw new Error('Failed to retrieve bank details');
      }
      return result;
    } catch (error) {
      console.error('Error creating or updating bank details:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('Failed to create or update bank details');
    }
  }

  async deleteBankDetails(userId: number): Promise<{ message: string }> {
    try {
      // Check if bank details exist for this user
      const existingBankDetails = (await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId))) as BankDetailsQueryResult[];

      if (existingBankDetails.length === 0) {
        throw new NotFoundException('Bank details not found for this user');
      }

      // Delete bank details
      await db
        .delete(userBankDetails)
        .where(eq(userBankDetails.userId, userId));

      return { message: 'Bank details deleted successfully' };
    } catch (error) {
      console.error('Error deleting bank details:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to delete bank details');
    }
  }

  async checkBankDetailsExist(userId: number): Promise<boolean> {
    try {
      const result = (await db
        .select({ id: userBankDetails.id })
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId))) as UserExistenceCheck[];

      return result.length > 0;
    } catch (error) {
      console.error('Error checking bank details existence:', error);
      throw new Error('Failed to check bank details existence');
    }
  }

  validateBankDetails(bankDetails: BankDetailsDto): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate required fields
    if (!bankDetails.bankName?.trim()) {
      errors.push('Bank name is required');
    }
    if (!bankDetails.accountNumber?.trim()) {
      errors.push('Account number is required');
    }
    if (!bankDetails.ifscCode?.trim()) {
      errors.push('IFSC code is required');
    }
    if (!bankDetails.accountHolderName?.trim()) {
      errors.push('Account holder name is required');
    }

    // Validate IFSC code format
    if (
      bankDetails.ifscCode &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)
    ) {
      errors.push(
        'Invalid IFSC code format. Must be 4 letters + 0 + 6 alphanumeric characters',
      );
    }

    // Validate account number format
    if (
      bankDetails.accountNumber &&
      !/^\d{9,18}$/.test(bankDetails.accountNumber)
    ) {
      errors.push('Invalid account number format');
    }

    // Validate bank name length
    if (bankDetails.bankName && bankDetails.bankName.length > 255) {
      errors.push('Bank name is too long');
    }

    // Validate account holder name length
    if (
      bankDetails.accountHolderName &&
      bankDetails.accountHolderName.length > 255
    ) {
      errors.push('Account holder name is too long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getAllBankDetailsWithUsers(): Promise<BankDetailsWithUser[]> {
    try {
      const result = (await db
        .select({
          id: userBankDetails.id,
          accountNumber: userBankDetails.accountNumber,
          ifscCode: userBankDetails.ifscCode,
          bankName: userBankDetails.bankName,
          accountHolderName: userBankDetails.accountHolderName,
          redeemAmount: userBankDetails.redeemAmount,
          redeemStatus: userBankDetails.redeemStatus,
          created_at: userBankDetails.created_at,
          updated_at: userBankDetails.updated_at,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
            mobileNumber: users.mobileNumber,
            referral_code: users.referral_code,
            referralCount: users.referralCount,
            wallet_balance: users.wallet_balance,
            payment_status: users.payment_status,
            created_at: users.created_at,
            updated_at: users.updated_at,
          },
        })
        .from(userBankDetails)
        .innerJoin(users, eq(userBankDetails.userId, users.id))
        .orderBy(
          userBankDetails.created_at,
        )) as BankDetailsWithUserQueryResult[];

      return result.map((item: BankDetailsWithUserQueryResult) => ({
        id: item.id,
        accountNumber: item.accountNumber,
        ifscCode: item.ifscCode,
        bankName: item.bankName,
        accountHolderName: item.accountHolderName,
        redeemAmount: item.redeemAmount ?? 0,
        redeemStatus: item.redeemStatus ?? 'processing',
        created_at: item.created_at,
        updated_at: item.updated_at,
        user: {
          id: item.user.id,
          name: item.user.name,
          email: item.user.email,
          mobileNumber: item.user.mobileNumber,
          referral_code: item.user.referral_code,
          referralCount: item.user.referralCount,
          wallet_balance: item.user.wallet_balance,
          payment_status: item.user.payment_status,
          created_at: item.user.created_at,
          updated_at: item.user.updated_at,
        },
      }));
    } catch (error) {
      console.error('Error fetching all bank details with users:', error);
      throw new Error('Failed to fetch bank details');
    }
  }

  async updateRedeemAmount(
    userId: number,
    redeemAmount: number,
  ): Promise<BankDetailsWithUser> {
    try {
      // Validate redeem amount
      if (redeemAmount <= 0) {
        throw new BadRequestException('Redeem amount must be greater than 0');
      }

      if (redeemAmount < 250) {
        throw new BadRequestException('Minimum redeem amount is ₹250');
      }

      // Get current user data to validate redeem amount
      const currentUser = (await db
        .select({
          wallet_balance: users.wallet_balance,
          referralCount: users.referralCount,
          referralCountAtLastRedeem: users.referralCountAtLastRedeem,
        })
        .from(users)
        .where(eq(users.id, userId))) as UserQueryResult[];

      if (currentUser.length === 0) {
        throw new NotFoundException('User not found');
      }

      const user = currentUser[0];
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const currentReferralCount = user.referralCount ?? 0;

      // Calculate total earned amount (referrals * 250)
      const totalEarnedAmount = currentReferralCount * 250;

      // Get total already redeemed amount
      const totalRedeemed = (await db
        .select({ total: redeemHistory.redeemAmount })
        .from(redeemHistory)
        .where(eq(redeemHistory.userId, userId))) as RedeemHistoryQueryResult[];

      const totalAlreadyRedeemed = totalRedeemed.reduce(
        (sum, item: RedeemHistoryQueryResult) => sum + (item.total ?? 0),
        0,
      );

      // Calculate maximum redeemable amount
      const maxRedeemableAmount = totalEarnedAmount - totalAlreadyRedeemed;

      console.log('Total earned amount:', totalEarnedAmount);
      console.log('Total already redeemed:', totalAlreadyRedeemed);
      console.log('Max redeemable amount:', maxRedeemableAmount);
      console.log('Requested redeem amount:', redeemAmount);

      // Validate that user is not trying to redeem more than they've earned
      if (redeemAmount > maxRedeemableAmount) {
        throw new BadRequestException(
          `You can only redeem up to ₹${maxRedeemableAmount}. You have earned ₹${totalEarnedAmount} total and already redeemed ₹${totalAlreadyRedeemed}.`,
        );
      }

      // Check if bank details exist
      const existingBankDetails = (await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId))) as BankDetailsQueryResult[];

      if (existingBankDetails.length === 0) {
        throw new NotFoundException('Bank details not found');
      }

      const bankDetailsData = existingBankDetails[0];
      if (!bankDetailsData) {
        throw new NotFoundException('Bank details not found');
      }

      // Update bank details with new redeem amount
      await db
        .update(userBankDetails)
        .set({
          redeemAmount,
          redeemStatus: 'processing',
          updated_at: new Date(),
        })
        .where(eq(userBankDetails.userId, userId));

      // Create redeem history entry
      const bankDetailsJson = JSON.stringify({
        bankName: bankDetailsData.bankName,
        accountNumber: bankDetailsData.accountNumber,
        ifscCode: bankDetailsData.ifscCode,
        accountHolderName: bankDetailsData.accountHolderName,
      });

      await db.insert(redeemHistory).values({
        userId,
        redeemAmount,
        status: 'processing',
        bankDetails: bankDetailsJson,
      });

      // Get the updated bank details with user information
      const result = await this.getBankDetailsWithUser(userId);
      if (!result) {
        throw new Error('Failed to retrieve updated bank details');
      }

      return result;
    } catch (error) {
      console.error('Error updating redeem amount:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('Failed to update redeem amount');
    }
  }

  async updateRedeemStatus(
    userId: number,
    status: 'processing' | 'deposited',
  ): Promise<BankDetailsWithUser> {
    try {
      // Check if bank details exist for this user
      const existingBankDetails = (await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId))) as BankDetailsQueryResult[];

      if (existingBankDetails.length === 0) {
        throw new NotFoundException('Bank details not found for this user');
      }

      const existing = existingBankDetails[0];
      if (!existing) {
        throw new NotFoundException('Bank details not found for this user');
      }

      // Update redeem status
      await db
        .update(userBankDetails)
        .set({
          redeemStatus: status,
          updated_at: new Date(),
        })
        .where(eq(userBankDetails.userId, userId));

      // If status is deposited, update redeem history and create payout
      if (status === 'deposited') {
        // Update the latest redeem history record with 'processing' status
        const latestProcessingRecord = (await db
          .select({
            id: redeemHistory.id,
            redeemAmount: redeemHistory.redeemAmount,
            bankDetails: redeemHistory.bankDetails,
          })
          .from(redeemHistory)
          .where(
            and(
              eq(redeemHistory.userId, userId),
              eq(redeemHistory.status, 'processing'),
            ),
          )
          .orderBy(
            redeemHistory.redeemedAt,
          )) as LatestProcessingRecordQueryResult[];

        if (latestProcessingRecord.length > 0) {
          // Get the latest record (last one after ordering by redeemedAt)
          const latestRecord =
            latestProcessingRecord[latestProcessingRecord.length - 1];
          if (!latestRecord) {
            throw new Error('No processing record found');
          }

          await db
            .update(redeemHistory)
            .set({
              status: 'deposited',
              depositedAt: new Date(),
            })
            .where(eq(redeemHistory.id, latestRecord.id));

          // Create payout record
          const bankDetailsParsed: {
            bankName?: string;
            accountNumber?: string;
            ifscCode?: string;
          } = latestRecord.bankDetails
            ? (JSON.parse(latestRecord.bankDetails) as {
                bankName?: string;
                accountNumber?: string;
                ifscCode?: string;
              })
            : {};
          const payoutId = `PAY-${Date.now()}-${userId}`;

          await db.insert(payouts).values({
            userId,
            payoutId,
            amount: latestRecord.redeemAmount ?? 0,
            method: 'Bank Transfer',
            status: 'completed',
            description: 'Wallet Redemption Payout',
            bankDetails: `${bankDetailsParsed.bankName ?? 'N/A'} - A/C: ${bankDetailsParsed.accountNumber ?? 'N/A'} - IFSC: ${bankDetailsParsed.ifscCode ?? 'N/A'}`,
            transactionId: `TXN-${Date.now()}`,
          });
        }
      }

      // Return the updated bank details with user information
      const result = await this.getBankDetailsWithUser(userId);
      if (!result) {
        throw new Error('Failed to retrieve updated bank details');
      }
      return result;
    } catch (error) {
      console.error('Error updating redeem status:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to update redeem status');
    }
  }

  async getRedeemHistory(userId: number): Promise<RedeemHistoryItem[]> {
    try {
      console.log('Fetching redeem history for user:', userId);

      const result = (await db
        .select({
          id: redeemHistory.id,
          redeemAmount: redeemHistory.redeemAmount,
          status: redeemHistory.status,
          bankDetails: redeemHistory.bankDetails,
          redeemedAt: redeemHistory.redeemedAt,
          depositedAt: redeemHistory.depositedAt,
        })
        .from(redeemHistory)
        .where(eq(redeemHistory.userId, userId))
        .orderBy(redeemHistory.redeemedAt)) as RedeemHistoryItem[];

      console.log('Raw redeem history result:', result);

      const mappedResult = result.map((item: RedeemHistoryItem) => ({
        ...item,
        bankDetails: item.bankDetails ? JSON.parse(item.bankDetails) : null,
      }));

      console.log('Mapped redeem history result:', mappedResult);
      return mappedResult;
    } catch (error) {
      console.error('Error fetching redeem history:', error);
      throw new Error('Failed to fetch redeem history');
    }
  }
}
