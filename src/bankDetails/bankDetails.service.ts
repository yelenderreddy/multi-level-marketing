import { Injectable } from '@nestjs/common';
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
} 