import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { users } from '../db/schemas/userSchema';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { endOfMonth, startOfMonth, startOfDay, endOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { and, eq, gte, lte, sql } from 'drizzle-orm';

const TIMEZONE = 'America/Los_Angeles';

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
      const referrerResult = await db
        .select()
        .from(users)
        .where(eq(users.referral_code, referralCode));

      if (!referrerResult || referrerResult.length === 0) {
        throw new NotFoundException(`Invalid referral code: ${referralCode}`);
      }

      finalReferredByCode = referrerResult[0].referral_code;
      // Increment referralCount for the referrer (ensure field name matches schema)
      const currentCount = referrerResult[0].referralCount || 0;
      const newReferralCount = currentCount + 1;
      const newWalletBalance = newReferralCount * 250;

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
        const currentCount = referrerResult[0].referralCount || 0;
        const newReferralCount = currentCount + 1;
        const newWalletBalance = newReferralCount * 250;

        await db
          .update(users)
          .set({
            referralCount: newReferralCount,
            wallet_balance: newWalletBalance,
            updated_at: new Date(),
          })
          .where(eq(users.referral_code, referredByCode));
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
    const userResult = await db.select().from(users).where(eq(users.id, id));

    if (!userResult || userResult.length === 0) {
      throw new NotFoundException('User not found');
    }

    const user = userResult[0];
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
        wallet_balance:user.wallet_balance,
        created_at: user.created_at,
      },
    };
  }

  async loginUser(email: string, password: string) {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!userResult || userResult.length === 0) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = userResult[0];
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
    const referredUsers = await db
      .select()
      .from(users)
      .where(eq(users.referred_by_code, referralCode));

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

    const todayUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.referred_by_code, referralCode),
          gte(users.created_at, startTodayUTC),
          lte(users.created_at, endTodayUTC),
        ),
      );

    const monthUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.referred_by_code, referralCode),
          gte(users.created_at, startMonthUTC),
          lte(users.created_at, endMonthUTC),
        ),
      );

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
      const userResult = await db.select().from(users).where(eq(users.id, id));

      if (!userResult || userResult.length === 0) {
        throw new NotFoundException('User not found');
      }

      const updatePayload: any = {};

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

      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        data: updated[0],
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to update user',
      );
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
    if (!newPassword) {
      throw new InternalServerErrorException('New password is required');
    }
    const encryptedPassword = this.encryptPassword(newPassword);
    const result = await db
      .update(users)
      .set({ password_hash: encryptedPassword })
      .where(eq(users.id, id))
      .returning();
    if (!result || result.length === 0) {
      throw new NotFoundException('User not found');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Password updated successfully',
      data: { id },
    };
  }

  async getAllUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [allUsers, [{ count }]] = await Promise.all([
      db.select().from(users).offset(offset).limit(limit),
      db.select({ count: sql`count(*)` }).from(users),
    ]);
    const usersWithoutPassword = allUsers.map(
      ({ password_hash, ...user }) => user,
    );
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
      // Get user's current referral count
      const userResult = await db
        .select({ referralCount: users.referralCount })
        .from(users)
        .where(eq(users.id, userId));

      if (!userResult || userResult.length === 0) {
        throw new NotFoundException('User not found');
      }

      const currentReferralCount = userResult[0].referralCount || 0;

      // Calculate wallet balance: referral count * 250
      const newWalletBalance = currentReferralCount * 250;

      // Update the wallet balance
      const updatedUser = await db
        .update(users)
        .set({
          wallet_balance: newWalletBalance,
          updated_at: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      return {
        statusCode: HttpStatus.OK,
        message: 'Wallet balance updated successfully',
        data: {
          userId,
          referralCount: currentReferralCount,
          walletBalance: newWalletBalance,
          user: updatedUser[0],
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to update wallet balance',
      );
    }
  }

  async updateWalletBalanceByReferralCode(referralCode: string) {
    try {
      // Get user by referral code
      const userResult = await db
        .select({ id: users.id, referralCount: users.referralCount })
        .from(users)
        .where(eq(users.referral_code, referralCode));

      if (!userResult || userResult.length === 0) {
        throw new NotFoundException('User not found with this referral code');
      }

      const userId = userResult[0].id;
      const currentReferralCount = userResult[0].referralCount || 0;

      // Calculate wallet balance: referral count * 250
      const newWalletBalance = currentReferralCount * 250;

      // Update the wallet balance
      const updatedUser = await db
        .update(users)
        .set({
          wallet_balance: newWalletBalance,
          updated_at: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      return {
        statusCode: HttpStatus.OK,
        message: 'Wallet balance updated successfully',
        data: {
          userId,
          referralCode,
          referralCount: currentReferralCount,
          walletBalance: newWalletBalance,
          user: updatedUser[0],
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to update wallet balance',
      );
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
      const calculatedBalance = user.referralCount * 250;

      return {
        statusCode: HttpStatus.OK,
        message: 'Wallet balance fetched successfully',
        data: {
          userId: user.id,
          userName: user.name,
          referralCount: user.referralCount,
          currentWalletBalance: user.wallet_balance,
          calculatedBalance,
          needsUpdate: user.wallet_balance !== calculatedBalance,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to get wallet balance',
      );
    }
  }
}
