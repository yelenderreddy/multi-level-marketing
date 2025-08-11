import { Injectable } from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { payments, users } from '../db/schemas';
import { eq, desc } from 'drizzle-orm';
import { PaymentResponseDto, PaymentStatsDto } from './payments.dto';

interface PaymentWithUser {
  id: number;
  userId: number;
  orderId: string;
  paymentId: string | null;
  amount: string;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  receipt: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    referral_code: string;
  } | null;
}

interface PaymentStats {
  amount: string | null;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
}

interface PaymentBasic {
  id: number;
  userId: number;
  orderId: string;
  paymentId: string | null;
  amount: string;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  receipt: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Type for database query results
type PaymentWithUserQueryResult = {
  id: number;
  userId: number;
  orderId: string;
  paymentId: string | null;
  amount: string;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  receipt: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    referral_code: string;
  } | null;
};

type PaymentStatsQueryResult = {
  amount: string | null;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
};

type PaymentBasicQueryResult = {
  id: number;
  userId: number;
  orderId: string;
  paymentId: string | null;
  amount: string;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  receipt: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PaymentsService {
  async getPaymentsByUserId(userId: number): Promise<PaymentResponseDto[]> {
    const userPayments = await db
      .select({
        id: payments.id,
        userId: payments.user_id,
        orderId: payments.order_id,
        paymentId: payments.payment_id,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        receipt: payments.receipt,
        createdAt: payments.created_at,
        updatedAt: payments.updated_at,
      })
      .from(payments)
      .where(eq(payments.user_id, userId))
      .orderBy(desc(payments.created_at));

    return userPayments.map((payment: PaymentBasic) => ({
      id: payment.id,
      userId: payment.userId,
      orderId: payment.orderId,
      paymentId: payment.paymentId || undefined,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      receipt: payment.receipt || undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    }));
  }

  async getAllPaymentsWithUsers(): Promise<PaymentResponseDto[]> {
    const allPayments = (await db
      .select({
        id: payments.id,
        userId: payments.user_id,
        orderId: payments.order_id,
        paymentId: payments.payment_id,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        receipt: payments.receipt,
        createdAt: payments.created_at,
        updatedAt: payments.updated_at,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          mobileNumber: users.mobileNumber,
          referral_code: users.referral_code,
        },
      })
      .from(payments)
      .leftJoin(users, eq(payments.user_id, users.id))
      .orderBy(desc(payments.created_at))) as PaymentWithUserQueryResult[];

    return allPayments.map((payment: PaymentWithUser) => ({
      id: payment.id,
      userId: payment.userId,
      orderId: payment.orderId,
      paymentId: payment.paymentId || undefined,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      receipt: payment.receipt || undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      user: payment.user,
    }));
  }

  async getPaymentStatsByUserId(userId: number): Promise<PaymentStatsDto> {
    const userPayments = (await db
      .select({
        amount: payments.amount,
        status: payments.status,
      })
      .from(payments)
      .where(eq(payments.user_id, userId))) as PaymentStatsQueryResult[];

    let totalPayments = 0;
    let totalAmount = 0;
    let pendingAmount = 0;
    let paidAmount = 0;
    let failedAmount = 0;
    let refundedAmount = 0;

    userPayments.forEach((payment: PaymentStats) => {
      totalPayments++;
      const amount = parseFloat(payment.amount || '0');
      totalAmount += amount;

      switch (payment.status) {
        case 'PENDING':
          pendingAmount += amount;
          break;
        case 'PAID':
          paidAmount += amount;
          break;
        case 'FAILED':
          failedAmount += amount;
          break;
        case 'REFUNDED':
          refundedAmount += amount;
          break;
      }
    });

    return {
      totalPayments,
      totalAmount,
      pendingAmount,
      paidAmount,
      failedAmount,
      refundedAmount,
    };
  }

  async getPaymentById(paymentId: number): Promise<PaymentResponseDto | null> {
    const payment = (await db
      .select({
        id: payments.id,
        userId: payments.user_id,
        orderId: payments.order_id,
        paymentId: payments.payment_id,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        receipt: payments.receipt,
        createdAt: payments.created_at,
        updatedAt: payments.updated_at,
      })
      .from(payments)
      .where(eq(payments.id, paymentId))) as PaymentBasicQueryResult[];

    if (payment.length === 0) {
      return null;
    }

    const paymentData = payment[0] as PaymentBasic;
    if (!paymentData) {
      return null;
    }

    return {
      id: paymentData.id,
      userId: paymentData.userId,
      orderId: paymentData.orderId,
      paymentId: paymentData.paymentId || undefined,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: paymentData.status,
      receipt: paymentData.receipt || undefined,
      createdAt: paymentData.createdAt,
      updatedAt: paymentData.updatedAt,
    };
  }

  async getPaymentsWithUserDetails(): Promise<PaymentWithUser[]> {
    try {
      const result = (await db
        .select({
          id: payments.id,
          userId: payments.user_id,
          orderId: payments.order_id,
          paymentId: payments.payment_id,
          amount: payments.amount,
          currency: payments.currency,
          status: payments.status,
          receipt: payments.receipt,
          createdAt: payments.created_at,
          updatedAt: payments.updated_at,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
            mobileNumber: users.mobileNumber,
            referral_code: users.referral_code,
          },
        })
        .from(payments)
        .leftJoin(users, eq(payments.user_id, users.id))
        .orderBy(payments.created_at)) as PaymentWithUserQueryResult[];

      return result.map((item: PaymentWithUser) => ({
        id: item.id,
        userId: item.userId,
        orderId: item.orderId,
        paymentId: item.paymentId,
        amount: item.amount,
        currency: item.currency,
        status: item.status,
        receipt: item.receipt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: item.user
          ? {
              id: item.user.id,
              name: item.user.name,
              email: item.user.email,
              mobileNumber: item.user.mobileNumber,
              referral_code: item.user.referral_code,
            }
          : null,
      }));
    } catch (error) {
      console.error('Error fetching payments with user details:', error);
      throw new Error('Failed to fetch payments with user details');
    }
  }
}
