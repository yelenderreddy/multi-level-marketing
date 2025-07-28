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
import { and, eq, gte, lte } from 'drizzle-orm';

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
    return new Date(
      new Date(date).toLocaleString('en-US', { timeZone })
    );
  }

  async createUser(
    name: string,
    email: string,
    password: string,
    mobileNumber: string,
    referralCode?: string,
    gender?: string,
    address?: string

  ) {
    if (!name || !email || !password) {
      throw new InternalServerErrorException('Name, email, and password are required');
    }

    const encryptedPassword = this.encryptPassword(password);
    const newReferralCode = this.generateReferralCode();

    let referredByCode: string | null = null;

    if (referralCode) {
      const referrerResult = await db
        .select()
        .from(users)
        .where(eq(users.referral_code, referralCode));

      if (!referrerResult || referrerResult.length === 0) {
        throw new NotFoundException(`Invalid referral code: ${referralCode}`);
      }

      referredByCode = referrerResult[0].referral_code;
      // Increment referralCount for the referrer
      const currentCount = referrerResult[0].referralCount || 0;
      await db
        .update(users)
        .set({ referralCount: currentCount + 1 })
        .where(eq(users.referral_code, referredByCode));
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
        referred_by_code: referredByCode,
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
        address:createdUser.address,
        referral_code: createdUser.referral_code,
        referred_by: referredByCode,
        payment_status: createdUser.payment_status,
        created_at: createdUser.created_at,
      },
    };
  }

  async getUserById(id: number) {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

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
        password: decryptedPassword,
        referral_code: user.referral_code,
        referred_by: user.referred_by_code,
        payment_status: user.payment_status,
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
  const TIMEZONE = 'America/Los_Angeles';

  // Get now in LA timezone
  const nowInLA = toZonedTime(now, TIMEZONE);

  // Start & end of today in LA
  const startTodayInLA = startOfDay(nowInLA);
  const endTodayInLA = endOfDay(nowInLA);

  // Start & end of this month in LA
  const startMonthInLA = startOfMonth(nowInLA);
  const endMonthInLA = endOfMonth(nowInLA);

  console.log({
    startTodayInLA,
    endTodayInLA,
    startMonthInLA,
    endMonthInLA
  });

  const todayUsers = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.referred_by_code, referralCode),
        gte(users.created_at, startTodayInLA),
        lte(users.created_at, endTodayInLA)
      )
    );

  const monthUsers = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.referred_by_code, referralCode),
        gte(users.created_at, startMonthInLA),
        lte(users.created_at, endMonthInLA)
      )
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
    throw new InternalServerErrorException(error.message || 'Failed to update user');
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

  async getAllUsers() {
    const allUsers = await db.select().from(users);
    // Exclude password_hash from the returned data
    return allUsers.map(({ password_hash, ...user }) => user);
  }

}
