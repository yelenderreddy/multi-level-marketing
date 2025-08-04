import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { userBankDetails, users } from '../db/schemas';
import { eq } from 'drizzle-orm';

export interface BankDetailsDto {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
}

export interface BankDetailsWithUser {
  id: number;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
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

  async updateBankDetails(userId: number, bankDetails: BankDetailsDto): Promise<BankDetailsWithUser> {
    try {
      // Check if bank details exist for this user
      const existingBankDetails = await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId));

      if (existingBankDetails.length === 0) {
        throw new NotFoundException('Bank details not found for this user');
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
      // Check if bank details already exist for this user
      const existingBankDetails = await db
        .select()
        .from(userBankDetails)
        .where(eq(userBankDetails.userId, userId));

      if (existingBankDetails.length > 0) {
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
      } else {
        // Create new bank details
        await db.insert(userBankDetails).values({
          userId,
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
          bankName: bankDetails.bankName,
          accountHolderName: bankDetails.accountHolderName,
        });
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
} 