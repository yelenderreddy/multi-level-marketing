import { Injectable, NotFoundException, BadRequestException, HttpStatus } from '@nestjs/common';
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

@Injectable()
export class BankDetailsService {
  async getBankDetailsWithUser(userId: number): Promise<BankDetailsWithUser | null> {
    try {
      const result = await db
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
        .where(eq(userBankDetails.userId, userId));

      if (result.length === 0) {
        return null;
      }

      return result[0] as BankDetailsWithUser;
    } catch (error) {
      console.error('Error fetching bank details with user:', error);
      throw new Error('Failed to fetch bank details');
    }
  }

  async createBankDetails(userId: number, bankDetails: BankDetailsDto): Promise<BankDetailsWithUser> {
    try {
      // Check if user exists
      const userExists = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId));

      if (userExists.length === 0) {
        throw new NotFoundException('User not found');
      }

      // Check if bank details already exist for this user
      const existingBankDetails = await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId));

      if (existingBankDetails.length > 0) {
        throw new BadRequestException('Bank details already exist for this user. Use update instead.');
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
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Failed to create bank details');
    }
  }

  async updateBankDetails(userId: number, bankDetails: BankDetailsDto): Promise<BankDetailsWithUser | null> {
    try {
      // Check if bank details exist for this user
      const existingBankDetails = await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId));

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

  async createOrUpdateBankDetails(userId: number, bankDetails: BankDetailsDto): Promise<BankDetailsWithUser> {
    try {
      // Validate redeem amount if provided
      if (bankDetails.redeemAmount !== undefined && bankDetails.redeemAmount > 0) {
        // Get current user data to validate redeem amount
        const currentUser = await db
          .select({ 
            wallet_balance: users.wallet_balance, 
            referralCount: users.referralCount,
            referralCountAtLastRedeem: users.referralCountAtLastRedeem
          })
          .from(users)
          .where(eq(users.id, userId));
        
        if (currentUser.length === 0) {
          throw new NotFoundException('User not found');
        }

        const user = currentUser[0];
        const currentWalletBalance = user.wallet_balance || 0;
        const currentReferralCount = user.referralCount || 0;
        const lastRedeemReferralCount = user.referralCountAtLastRedeem || 0;
        
        // Calculate total earned amount (referrals * 250)
        const totalEarnedAmount = currentReferralCount * 250;
        
        // Get total already redeemed amount
        const totalRedeemed = await db
          .select({ total: redeemHistory.redeemAmount })
          .from(redeemHistory)
          .where(eq(redeemHistory.userId, userId));
        
        const totalAlreadyRedeemed = totalRedeemed.reduce((sum, item) => sum + (item.total || 0), 0);
        
        // Calculate maximum redeemable amount
        const maxRedeemableAmount = totalEarnedAmount - totalAlreadyRedeemed;
        
        console.log('Total earned amount:', totalEarnedAmount);
        console.log('Total already redeemed:', totalAlreadyRedeemed);
        console.log('Max redeemable amount:', maxRedeemableAmount);
        console.log('Requested redeem amount:', bankDetails.redeemAmount);
        
        // Validate that user is not trying to redeem more than they've earned
        if (bankDetails.redeemAmount > maxRedeemableAmount) {
          throw new BadRequestException(`You can only redeem up to ₹${maxRedeemableAmount}. You have earned ₹${totalEarnedAmount} total and already redeemed ₹${totalAlreadyRedeemed}.`);
        }
        
        // Validate minimum redeem amount
        if (bankDetails.redeemAmount < 250) {
          throw new BadRequestException('Minimum redeem amount is ₹250');
        }
      }

      // Check if bank details already exist for this user
      const existingBankDetails = await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId));

      if (existingBankDetails.length > 0) {
        // Update existing bank details
        const updateData: any = {
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
          bankName: bankDetails.bankName,
          accountHolderName: bankDetails.accountHolderName,
          updated_at: new Date(),
        };

        // Add redeem amount and status if provided
        if (bankDetails.redeemAmount !== undefined) {
          updateData.redeemAmount = bankDetails.redeemAmount;
        }
        if (bankDetails.redeemStatus !== undefined) {
          updateData.redeemStatus = bankDetails.redeemStatus;
        }

        await db
          .update(userBankDetails)
          .set(updateData)
          .where(eq(userBankDetails.userId, userId));

        // Create redeem history entry if redeem amount is provided and it's a new redeem request
        if (bankDetails.redeemAmount !== undefined && bankDetails.redeemAmount > 0) {
          console.log('Creating redeem history entry for existing user:', userId, 'amount:', bankDetails.redeemAmount);
          
          const bankDetailsJson = JSON.stringify({
            bankName: bankDetails.bankName,
            accountNumber: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode,
            accountHolderName: bankDetails.accountHolderName,
          });

          await db.insert(redeemHistory).values({
            userId,
            redeemAmount: bankDetails.redeemAmount,
            status: bankDetails.redeemStatus || 'processing',
            bankDetails: bankDetailsJson,
          });
          
          console.log('Redeem history entry created successfully for existing user');
        }
      } else {
        // Create new bank details
        const insertData: any = {
          userId,
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
          bankName: bankDetails.bankName,
          accountHolderName: bankDetails.accountHolderName,
        };

        // Add redeem amount and status if provided
        if (bankDetails.redeemAmount !== undefined) {
          insertData.redeemAmount = bankDetails.redeemAmount;
        }
        if (bankDetails.redeemStatus !== undefined) {
          insertData.redeemStatus = bankDetails.redeemStatus;
        }

        await db.insert(userBankDetails).values(insertData);
      }

      // Create redeem history entry if redeem amount is provided
      if (bankDetails.redeemAmount !== undefined && bankDetails.redeemAmount > 0) {
        console.log('Creating redeem history entry for user:', userId, 'amount:', bankDetails.redeemAmount);
        
        const bankDetailsJson = JSON.stringify({
          bankName: bankDetails.bankName,
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
          accountHolderName: bankDetails.accountHolderName,
        });

        await db.insert(redeemHistory).values({
          userId,
          redeemAmount: bankDetails.redeemAmount,
          status: bankDetails.redeemStatus || 'processing',
          bankDetails: bankDetailsJson,
        });
        
        console.log('Redeem history entry created successfully');
      }

      // Update wallet balance and track referral count when user redeems money
      if (bankDetails.redeemAmount !== undefined && bankDetails.redeemAmount > 0) {
        console.log('Processing redeem for user:', userId, 'amount:', bankDetails.redeemAmount);
        
        // Get current user data
        const currentUser = await db
          .select({ 
            wallet_balance: users.wallet_balance, 
            referralCount: users.referralCount,
            referralCountAtLastRedeem: users.referralCountAtLastRedeem
          })
          .from(users)
          .where(eq(users.id, userId));
        
        if (currentUser.length > 0) {
          const user = currentUser[0];
          const currentWalletBalance = user.wallet_balance || 0;
          const currentReferralCount = user.referralCount || 0;
          const lastRedeemReferralCount = user.referralCountAtLastRedeem || 0;
          
          // Calculate new wallet balance: simply deduct the redeemed amount
          const newWalletBalance = Math.max(0, currentWalletBalance - bankDetails.redeemAmount);
          
          console.log('Current wallet balance:', currentWalletBalance);
          console.log('Redeem amount:', bankDetails.redeemAmount);
          console.log('New wallet balance:', newWalletBalance);
          
          await db
            .update(users)
            .set({
              wallet_balance: newWalletBalance,
              referralCountAtLastRedeem: currentReferralCount,
              updated_at: new Date(),
            })
            .where(eq(users.id, userId));
          
          console.log('Wallet balance updated successfully');
        }
      }

      // Return the updated/created bank details with user information
      const result = await this.getBankDetailsWithUser(userId);
      if (!result) {
        throw new Error('Failed to retrieve created/updated bank details');
      }
      return result;
    } catch (error) {
      console.error('Error creating/updating bank details:', error);
      throw new Error('Failed to create/update bank details');
    }
  }

  async deleteBankDetails(userId: number): Promise<{ message: string }> {
    try {
      // Check if bank details exist for this user
      const existingBankDetails = await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId));

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
      const result = await db
        .select({ id: userBankDetails.id })
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId));

      return result.length > 0;
    } catch (error) {
      console.error('Error checking bank details existence:', error);
      throw new Error('Failed to check bank details existence');
    }
  }

  async validateBankDetails(bankDetails: BankDetailsDto): Promise<{ isValid: boolean; errors: string[] }> {
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
    if (bankDetails.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)) {
      errors.push('Invalid IFSC code format. Must be 4 letters + 0 + 6 alphanumeric characters');
    }

    // Validate account number format
    if (bankDetails.accountNumber && !/^\d{9,18}$/.test(bankDetails.accountNumber)) {
      errors.push('Invalid account number format');
    }

    // Validate bank name length
    if (bankDetails.bankName && bankDetails.bankName.length > 255) {
      errors.push('Bank name is too long');
    }

    // Validate account holder name length
    if (bankDetails.accountHolderName && bankDetails.accountHolderName.length > 255) {
      errors.push('Account holder name is too long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getAllBankDetailsWithUsers(): Promise<BankDetailsWithUser[]> {
    try {
      const result = await db
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
        .orderBy(userBankDetails.created_at);

      return result as BankDetailsWithUser[];
    } catch (error) {
      console.error('Error fetching all bank details with users:', error);
      throw new Error('Failed to fetch bank details');
    }
  }



  async updateRedeemAmount(userId: number, redeemAmount: number): Promise<BankDetailsWithUser> {
    try {
      // Check if bank details exist for this user
      const existingBankDetails = await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId));

      if (existingBankDetails.length === 0) {
        throw new NotFoundException('Bank details not found for this user');
      }

      // Validate redeem amount
      if (redeemAmount < 250) {
        throw new BadRequestException('Minimum redeem amount is ₹250');
      }

      // Get current user data to validate redeem amount
      const currentUser = await db
        .select({ 
          wallet_balance: users.wallet_balance, 
          referralCount: users.referralCount,
          referralCountAtLastRedeem: users.referralCountAtLastRedeem
        })
        .from(users)
        .where(eq(users.id, userId));

      if (currentUser.length === 0) {
        throw new NotFoundException('User not found');
      }

      const user = currentUser[0];
      const currentReferralCount = user.referralCount || 0;
      
      // Calculate total earned amount (referrals * 250)
      const totalEarnedAmount = currentReferralCount * 250;
      
      // Get total already redeemed amount
      const totalRedeemed = await db
        .select({ total: redeemHistory.redeemAmount })
        .from(redeemHistory)
        .where(eq(redeemHistory.userId, userId));
      
      const totalAlreadyRedeemed = totalRedeemed.reduce((sum, item) => sum + (item.total || 0), 0);
      
      // Calculate maximum redeemable amount
      const maxRedeemableAmount = totalEarnedAmount - totalAlreadyRedeemed;
      
      console.log('Total earned amount:', totalEarnedAmount);
      console.log('Total already redeemed:', totalAlreadyRedeemed);
      console.log('Max redeemable amount:', maxRedeemableAmount);
      console.log('Requested redeem amount:', redeemAmount);
      
      // Validate that user is not trying to redeem more than they've earned
      if (redeemAmount > maxRedeemableAmount) {
        throw new BadRequestException(`You can only redeem up to ₹${maxRedeemableAmount}. You have earned ₹${totalEarnedAmount} total and already redeemed ₹${totalAlreadyRedeemed}.`);
      }

      // Update redeem amount and reset status to processing
      await db
        .update(userBankDetails)
        .set({
          redeemAmount: redeemAmount,
          redeemStatus: 'processing',
          updated_at: new Date(),
        })
        .where(eq(userBankDetails.userId, userId));

      // Create redeem history entry
      const bankDetailsJson = JSON.stringify({
        bankName: existingBankDetails[0].bankName,
        accountNumber: existingBankDetails[0].accountNumber,
        ifscCode: existingBankDetails[0].ifscCode,
        accountHolderName: existingBankDetails[0].accountHolderName,
      });

      await db.insert(redeemHistory).values({
        userId,
        redeemAmount,
        status: 'processing',
        bankDetails: bankDetailsJson,
      });

      // Update wallet balance and track referral count when user redeems money
      console.log('Processing redeem for user:', userId, 'amount:', redeemAmount);
      
      // Get current user data for wallet update
      const userForWalletUpdate = await db
        .select({ 
          wallet_balance: users.wallet_balance, 
          referralCount: users.referralCount,
          referralCountAtLastRedeem: users.referralCountAtLastRedeem
        })
        .from(users)
        .where(eq(users.id, userId));
      
      if (userForWalletUpdate.length > 0) {
        const userData = userForWalletUpdate[0];
        const currentWalletBalance = userData.wallet_balance || 0;
        const currentReferralCount = userData.referralCount || 0;
        
        // Calculate new wallet balance: simply deduct the redeemed amount
        const newWalletBalance = Math.max(0, currentWalletBalance - redeemAmount);
        
        console.log('Current wallet balance:', currentWalletBalance);
        console.log('Redeem amount:', redeemAmount);
        console.log('New wallet balance:', newWalletBalance);
        
        await db
          .update(users)
          .set({
            wallet_balance: newWalletBalance,
            referralCountAtLastRedeem: currentReferralCount,
            updated_at: new Date(),
          })
          .where(eq(users.id, userId));
        
        console.log('Wallet balance updated successfully');
      }

      // Return the updated bank details with user information
      const result = await this.getBankDetailsWithUser(userId);
      if (!result) {
        throw new Error('Failed to retrieve updated bank details');
      }
      return result;
    } catch (error) {
      console.error('Error updating redeem amount:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Failed to update redeem amount');
    }
  }

  async updateRedeemStatus(userId: number, status: 'processing' | 'deposited'): Promise<BankDetailsWithUser> {
    try {
      // Check if bank details exist for this user
      const existingBankDetails = await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId));

      if (existingBankDetails.length === 0) {
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
        const latestProcessingRecord = await db
          .select({ id: redeemHistory.id, redeemAmount: redeemHistory.redeemAmount, bankDetails: redeemHistory.bankDetails })
          .from(redeemHistory)
          .where(and(eq(redeemHistory.userId, userId), eq(redeemHistory.status, 'processing')))
          .orderBy(redeemHistory.redeemedAt);

        if (latestProcessingRecord.length > 0) {
          // Get the latest record (last one after ordering by redeemedAt)
          const latestRecord = latestProcessingRecord[latestProcessingRecord.length - 1];
          
          await db
            .update(redeemHistory)
            .set({
              status: 'deposited',
              depositedAt: new Date(),
            })
            .where(eq(redeemHistory.id, latestRecord.id));

          // Create payout record
          const bankDetailsParsed = latestRecord.bankDetails ? JSON.parse(latestRecord.bankDetails) : {};
          const payoutId = `PAY-${Date.now()}-${userId}`;
          
          await db.insert(payouts).values({
            userId,
            payoutId,
            amount: latestRecord.redeemAmount,
            method: 'Bank Transfer',
            status: 'completed',
            description: 'Wallet Redemption Payout',
            bankDetails: `${bankDetailsParsed.bankName || 'N/A'} - A/C: ${bankDetailsParsed.accountNumber || 'N/A'} - IFSC: ${bankDetailsParsed.ifscCode || 'N/A'}`,
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

  async getRedeemHistory(userId: number): Promise<any[]> {
    try {
      console.log('Fetching redeem history for user:', userId);
      
      const result = await db
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
        .orderBy(redeemHistory.redeemedAt);

      console.log('Raw redeem history result:', result);

      const mappedResult = result.map(item => ({
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