import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { payments, users } from '../db/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { PaymentResponseDto, PaymentStatsDto } from './payments.dto';

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

    return userPayments.map(payment => ({
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
    const allPayments = await db
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
      .orderBy(desc(payments.created_at));

    return allPayments.map(payment => ({
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
    const userPayments = await db
      .select({
        amount: payments.amount,
        status: payments.status,
      })
      .from(payments)
      .where(eq(payments.user_id, userId));

    let totalPayments = 0;
    let totalAmount = 0;
    let pendingAmount = 0;
    let paidAmount = 0;
    let failedAmount = 0;
    let refundedAmount = 0;

    userPayments.forEach(payment => {
      totalPayments++;
      const amount = parseFloat(payment.amount);
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

  async getPaymentById(paymentId: number): Promise<PaymentResponseDto> {
    const payment = await db
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
      .where(eq(payments.id, paymentId));

    if (payment.length === 0) {
      throw new NotFoundException('Payment not found');
    }

    const paymentData = payment[0];
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
} 