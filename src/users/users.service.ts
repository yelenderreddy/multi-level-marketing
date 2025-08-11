import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { users } from '../db/schemas/userSchema';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { endOfMonth, startOfMonth, startOfDay, endOfDay } from 'date-fns';
import { and, eq, gte, lte, sql } from 'drizzle-orm';

// Type for database query results
type UserQueryResult = {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  address: string | null;
  gender: string | null;
  password_hash: string;
  referral_code: string;
  referralCount: number;
  referralCountAtLastRedeem: number;
  reward: string | null;
  wallet_balance: number;
  referred_by_code: string | null;
  payment_status: string;
  created_at: Date;
  updated_at: Date;
};

type UserReferralQueryResult = {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  address: string | null;
  gender: string | null;
  referral_code: string;
  referred_by_code: string | null;
  payment_status: string;
  reward: string | null;
  referralCount: number;
  wallet_balance: number;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly jwtService: JwtService) {}

  private readonly encryptionKey = '12345678901234567890123456789012';
  private readonly iv = '1234567890123456';

  private encryptPassword(password: string): string {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey),
      Buffer.from(this.iv),
    );
    let encrypted = cipher.update(password);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  }

  private decryptPassword(encryptedPassword: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey),
      Buffer.from(this.iv),
    );
    let decrypted = decipher.update(Buffer.from(encryptedPassword, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  private generateReferralCode(length = 8): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private zonedTimeToUtc(date: Date, timeZone: string): Date {
    return new Date(new Date(date).toLocaleString('en-US', { timeZone }));
  }

  async createUser(
    name: string,
    email: string,
    password: string,
    mobileNumber: string,
    referralCode?: string,
    gender?: string,
    address?: string,
    referredByCode?: string,
    paymentStatus?: 'PENDING' | 'PAID',
    reward?: string,
    referralCount?: number,
  ) {
    if (!name || !email || !password) {
      throw new InternalServerErrorException(
        'Name, email, and password are required',
      );
    }

    const encryptedPassword = this.encryptPassword(password);
    const newReferralCode = this.generateReferralCode();

    let finalReferredByCode: string | null = null;

    if (referralCode) {
      const referrerResult = (await db
        .select()
        .from(users)
        .where(eq(users.referral_code, referralCode))) as UserQueryResult[];

      if (!referrerResult || referrerResult.length === 0) {
        throw new NotFoundException(`Invalid referral code: ${referralCode}`);
      }

      const referrer = referrerResult[0];
      if (!referrer) {
        throw new NotFoundException(`Invalid referral code: ${referralCode}`);
      }

      finalReferredByCode = referrer.referral_code;
      // Increment referralCount for the referrer
      const currentCount = referrer.referralCount || 0;
      const currentWalletBalance = referrer.wallet_balance || 0;
      const newReferralCount = currentCount + 1;

      // Calculate new wallet balance: existing balance + (new referrals since last redeem * 250)
      const newWalletBalance = currentWalletBalance + 250; // Add 250 for this new referral

      await db
        .update(users)
        .set({
          referralCount: newReferralCount,
          wallet_balance: newWalletBalance,
          updated_at: new Date(),
        })
        .where(eq(users.referral_code, finalReferredByCode));
    } else if (referredByCode) {
      // If referredByCode is provided directly, increment referralCount for that code
      const referrerResult = await db
        .select()
        .from(users)
        .where(eq(users.referral_code, referredByCode));
      if (referrerResult && referrerResult.length > 0) {
        const referrer = referrerResult[0];
        if (referrer) {
          const currentCount = referrer.referralCount || 0;
          const currentWalletBalance = referrer.wallet_balance || 0;
          const newReferralCount = currentCount + 1;

          // Calculate new wallet balance: existing balance + 250 for this new referral
          const newWalletBalance = currentWalletBalance + 250;

          await db
            .update(users)
            .set({
              referralCount: newReferralCount,
              wallet_balance: newWalletBalance,
              updated_at: new Date(),
            })
            .where(eq(users.referral_code, referredByCode));
        }
      }
      finalReferredByCode = referredByCode;
    }

    const result = await db
      .insert(users)
      .values({
        name,
        email,
        gender,
        address,
        mobileNumber,
        password_hash: encryptedPassword,
        referral_code: newReferralCode,
        referred_by_code: finalReferredByCode,
        payment_status: paymentStatus || 'PENDING',
        reward: reward || '',
        referralCount: referralCount || 0,
      })
      .returning();

    const createdUser = result[0];
    if (!createdUser) {
      throw new InternalServerErrorException('Failed to create user');
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        mobileNumber: createdUser.mobileNumber,
        gender: createdUser.gender,
        address: createdUser.address,
        referral_code: createdUser.referral_code,
        referred_by: createdUser.referred_by_code,
        payment_status: createdUser.payment_status,
        reward: createdUser.reward,
        referralCount: createdUser.referralCount,
        created_at: createdUser.created_at,
      },
    };
  }

  async getUserById(id: number) {
    const userResult = (await db
      .select()
      .from(users)
      .where(eq(users.id, id))) as UserQueryResult[];

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

    const decryptedPassword = this.decryptPassword(user.password_hash);

    return {
      statusCode: HttpStatus.OK,
      message: 'User fetched successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        address: user.address,
        referralCount: user.referralCount,
        password: decryptedPassword,
        referral_code: user.referral_code,
        referred_by: user.referred_by_code,
        payment_status: user.payment_status,
        wallet_balance: user.wallet_balance,
        created_at: user.created_at,
      },
    };
  }

  async loginUser(email: string, password: string) {
    const userResult = (await db
      .select()
      .from(users)
      .where(eq(users.email, email))) as UserQueryResult[];

    if (!userResult || userResult.length === 0) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = userResult[0];
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const decryptedPassword = this.decryptPassword(user.password_hash);

    if (decryptedPassword !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, name: user.name };
    const token = this.jwtService.sign(payload);

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        referral_code: user.referral_code,
        referred_by: user.referred_by_code,
        payment_status: user.payment_status,
        created_at: user.created_at,
        token,
      },
    };
  }

  async getUsersReferredBy(referralCode: string) {
    const referredUsers = (await db
      .select()
      .from(users)
      .where(
        eq(users.referred_by_code, referralCode),
      )) as UserReferralQueryResult[];

    return {
      statusCode: HttpStatus.OK,
      message: `Users referred by ${referralCode} fetched successfully`,
      data: referredUsers,
    };
  }

  async getReferralStats(referralCode: string) {
    const now = new Date();
    // Use UTC for today's referrals
    const startTodayUTC = startOfDay(now);
    const endTodayUTC = endOfDay(now);
    const startMonthUTC = startOfMonth(now);
    const endMonthUTC = endOfMonth(now);

    const todayUsers = (await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.referred_by_code, referralCode),
          gte(users.created_at, startTodayUTC),
          lte(users.created_at, endTodayUTC),
        ),
      )) as UserReferralQueryResult[];

    const monthUsers = (await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.referred_by_code, referralCode),
          gte(users.created_at, startMonthUTC),
          lte(users.created_at, endMonthUTC),
        ),
      )) as UserReferralQueryResult[];

    const todayCount = todayUsers.length;
    const monthCount = monthUsers.length;

    let reward: string | null = null;
    let todayNextGoal: string | null = null;
    let monthNextGoal: string | null = null;

    // 🎁 Check rewards
    if (monthCount >= 100) {
      reward = '🎁 ₹8000 product (100+ referrals this month)';
    } else if (monthCount >= 25) {
      reward = '🎁 Smartwatch (25 referrals this month)';
      monthNextGoal = `Only ${100 - monthCount} more referrals this month to get ₹8000 product`;
    } else if (todayCount >= 5) {
      reward = '🎁 ₹500 cash (5 referrals today)';
      monthNextGoal = `Only ${25 - monthCount} more referrals this month to get Smartwatch`;
    }

    if (todayCount < 5) {
      todayNextGoal = `Only ${5 - todayCount} more referrals today to earn ₹500 cash`;
    }

    if (monthCount < 25) {
      monthNextGoal = `Only ${25 - monthCount} more referrals this month to earn Smartwatch`;
    } else if (monthCount < 100) {
      monthNextGoal = `Only ${100 - monthCount} more referrals this month to earn ₹8000 product`;
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Referral stats fetched successfully',
      data: {
        todayReferrals: todayCount,
        monthReferrals: monthCount,
        reward,
        todayNextGoal,
        monthNextGoal,
      },
    };
  }
  async updateUserDetails(
    id: number,
    updates: {
      address?: string;
      gender?: string;
      referral_code?: string;
      referred_by_code?: string;
      payment_status?: 'PENDING' | 'PAID';
    },
  ) {
    try {
      const userResult = (await db
        .select()
        .from(users)
        .where(eq(users.id, id))) as UserQueryResult[];

      if (!userResult || userResult.length === 0) {
        throw new NotFoundException('User not found');
      }

      const user = userResult[0];
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updatePayload: Record<string, unknown> = {};

      if (updates.address !== undefined) {
        updatePayload.address = updates.address;
      }
      if (updates.gender !== undefined) {
        updatePayload.gender = updates.gender;
      }
      if (updates.referral_code !== undefined) {
        updatePayload.referral_code = updates.referral_code;
      }
      if (updates.referred_by_code !== undefined) {
        updatePayload.referred_by_code = updates.referred_by_code;
      }
      if (updates.payment_status !== undefined) {
        updatePayload.payment_status = updates.payment_status;
      }

      if (Object.keys(updatePayload).length === 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'No valid fields provided for update',
          data: null,
        };
      }

      updatePayload.updated_at = new Date(); // update the timestamp

      const updated = await db
        .update(users)
        .set(updatePayload)
        .where(eq(users.id, id))
        .returning();

      const updatedUser = updated[0];
      if (!updatedUser) {
        throw new InternalServerErrorException('Failed to update user');
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to update user',
        );
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async deleteUserById(id: number) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    if (!result || result.length === 0) {
      throw new NotFoundException('User not found');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
      data: { id },
    };
  }

  async updateUserPassword(id: number, newPassword: string) {
    try {
      const encryptedPassword = this.encryptPassword(newPassword);

      const result = await db
        .update(users)
        .set({
          password_hash: encryptedPassword,
          updated_at: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      if (!result || result.length === 0) {
        throw new NotFoundException('User not found');
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Password updated successfully',
        data: null,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to update password',
        );
      }
      throw new InternalServerErrorException('Failed to update password');
    }
  }

  async getAllUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [allUsers, [{ count }]] = await Promise.all([
      db.select().from(users).offset(offset).limit(limit),
      db.select({ count: sql`count(*)` }).from(users),
    ]);
    const usersWithoutPassword = allUsers.map(({ password_hash, ...user }) => {
      return user;
    });
    return {
      statusCode: 200,
      message: 'Users fetched successfully',
      data: {
        users: usersWithoutPassword,
        total: Number(count),
        page,
        pageSize: limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async updateWalletBalance(userId: number) {
    try {
      // Get user's current data
      const userResult = await db
        .select({
          referralCount: users.referralCount,
          referralCountAtLastRedeem: users.referralCountAtLastRedeem,
          wallet_balance: users.wallet_balance,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!userResult || userResult.length === 0) {
        throw new NotFoundException('User not found');
      }

      const user = userResult[0];
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const currentReferralCount = user.referralCount || 0;
      const referralCountAtLastRedeem = user.referralCountAtLastRedeem || 0;
      const currentWalletBalance = user.wallet_balance || 0;

      // Calculate new referrals since last redeem
      const newReferralsSinceLastRedeem =
        currentReferralCount - referralCountAtLastRedeem;

      // Calculate wallet balance: existing balance + (new referrals * 250)
      const newReferralsEarnings = newReferralsSinceLastRedeem * 250;
      const newWalletBalance = currentWalletBalance + newReferralsEarnings;

      // Update the wallet balance
      const updatedUser = await db
        .update(users)
        .set({
          wallet_balance: newWalletBalance,
          updated_at: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      const updatedUserData = updatedUser[0];
      if (!updatedUserData) {
        throw new InternalServerErrorException(
          'Failed to update wallet balance',
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Wallet balance updated successfully',
        data: {
          userId,
          referralCount: currentReferralCount,
          newReferralsSinceLastRedeem,
          newReferralsEarnings,
          walletBalance: newWalletBalance,
          user: updatedUserData,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to update wallet balance',
        );
      }
      throw new InternalServerErrorException('Failed to update wallet balance');
    }
  }

  async updateWalletBalanceByReferralCode(referralCode: string) {
    try {
      // Get user by referral code
      const userResult = await db
        .select({
          id: users.id,
          referralCount: users.referralCount,
          referralCountAtLastRedeem: users.referralCountAtLastRedeem,
          wallet_balance: users.wallet_balance,
        })
        .from(users)
        .where(eq(users.referral_code, referralCode));

      if (!userResult || userResult.length === 0) {
        throw new NotFoundException('User not found with this referral code');
      }

      const user = userResult[0];
      if (!user) {
        throw new NotFoundException('User not found with this referral code');
      }

      const userId = user.id;
      const currentReferralCount = user.referralCount || 0;
      const referralCountAtLastRedeem = user.referralCountAtLastRedeem || 0;
      const currentWalletBalance = user.wallet_balance || 0;

      // Calculate new referrals since last redeem
      const newReferralsSinceLastRedeem =
        currentReferralCount - referralCountAtLastRedeem;

      // Calculate wallet balance: existing balance + (new referrals * 250)
      const newReferralsEarnings = newReferralsSinceLastRedeem * 250;
      const newWalletBalance = currentWalletBalance + newReferralsEarnings;

      // Update the wallet balance
      const updatedUser = await db
        .update(users)
        .set({
          wallet_balance: newWalletBalance,
          updated_at: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      const updatedUserData = updatedUser[0];
      if (!updatedUserData) {
        throw new InternalServerErrorException(
          'Failed to update wallet balance',
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Wallet balance updated successfully',
        data: {
          userId,
          referralCode,
          referralCount: currentReferralCount,
          newReferralsSinceLastRedeem,
          newReferralsEarnings,
          walletBalance: newWalletBalance,
          user: updatedUserData,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to update wallet balance',
        );
      }
      throw new InternalServerErrorException('Failed to update wallet balance');
    }
  }

  async getWalletBalance(userId: number) {
    try {
      const userResult = await db
        .select({
          id: users.id,
          name: users.name,
          referralCount: users.referralCount,
          wallet_balance: users.wallet_balance,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!userResult || userResult.length === 0) {
        throw new NotFoundException('User not found');
      }

      const user = userResult[0];
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const calculatedBalance = (user.referralCount || 0) * 250;

      return {
        statusCode: HttpStatus.OK,
        message: 'Wallet balance fetched successfully',
        data: {
          userId: user.id,
          userName: user.name,
          referralCount: user.referralCount || 0,
          currentWalletBalance: user.wallet_balance || 0,
          calculatedBalance,
          needsUpdate: (user.wallet_balance || 0) !== calculatedBalance,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to get wallet balance',
        );
      }
      throw new InternalServerErrorException('Failed to get wallet balance');
    }
  }
}
