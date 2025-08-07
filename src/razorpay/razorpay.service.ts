// razorpay.service.ts
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import Razorpay from 'razorpay';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { db } from '../db/dbConnection/db.connect';
import { payments } from '../db/schemas/paymentSchema';
import { eq } from 'drizzle-orm';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;
  private webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      console.warn(
        'Razorpay credentials not configured. Using test credentials.',
      );
      // Use test credentials if not configured
      this.razorpay = new Razorpay({
        key_id: 'rzp_test_51HqjWmKgnvOcbXg',
        key_secret: 'test_secret_1234567890',
      });
    } else {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }

    this.webhookSecret =
      this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';
  }

  /**
   * Create an order and save to DB
   */
  async createOrderAndSave(
    userId: number,
    amount: number,
    currency = 'INR',
    receipt?: string,
    notes?: Record<string, string>,
  ) {
    try {
      // For development/testing, create a mock order if Razorpay is not configured
      if (!this.configService.get<string>('RAZORPAY_KEY_ID')) {
        console.log('Creating mock Razorpay order for development');
        const mockOrder = {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: amount * 100,
          currency,
          receipt,
          notes,
          status: 'created',
        };

        // save to DB
        await db.insert(payments).values({
          user_id: userId,
          order_id: mockOrder.id,
          amount: String(amount),
          currency,
          status: 'PENDING',
          receipt,
        });

        return mockOrder;
      }

      const order = await this.razorpay.orders.create({
        amount: amount * 100, // paise
        currency,
        receipt,
        notes,
      });

      // save to DB
      await db.insert(payments).values({
        user_id: userId,
        order_id: order.id,
        amount: String(amount),
        currency,
        status: 'PENDING',
        receipt,
      });

      return order;
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message ||
            'Failed to create payment order. Please try again later.',
        );
      }
      throw new InternalServerErrorException(
        'Failed to create payment order. Please try again later.',
      );
    }
  }

  /**
   * Mark payment as paid
   */
  async markPaymentAsPaid(orderId: string, paymentId: string) {
    const updated = await db
      .update(payments)
      .set({
        payment_id: paymentId,
        status: 'PAID',
        updated_at: new Date(),
      })
      .where(eq(payments.order_id, orderId));

    return updated;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
