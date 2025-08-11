// razorpay.controller.ts
import { Body, Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

// Type for Razorpay webhook payload
interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
      };
    };
  };
}

@Controller('api/payments')
export class RazorpayController {
  constructor(
    private readonly razorpayService: RazorpayService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create Razorpay Order + Save
   */
  @Post('/create-order')
  async createOrder(
    @Body()
    body: {
      user_id: number;
      amount: number;
      receipt?: string;
      notes?: Record<string, string>;
    },
  ) {
    const { user_id, amount, receipt, notes } = body;

    if (!user_id || !amount) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'User ID and Amount are required',
        data: null,
      };
    }

    const order = await this.razorpayService.createOrderAndSave(
      user_id,
      amount,
      'INR',
      receipt,
      notes,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Order created & saved successfully',
      data: order,
    };
  }

  /**
   * Razorpay Webhook
   */
  @Post('/webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const webhookSecret = this.configService.get<string>(
      'RAZORPAY_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      return res.status(500).send('Webhook secret is not configured');
    }

    const signature = req.headers['x-razorpay-signature'] as string;

    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const webhookBody = req.body as RazorpayWebhookPayload;
    const event = webhookBody.event;

    if (event === 'payment.captured') {
      const payload = webhookBody.payload;
      const paymentEntity = payload?.payment?.entity;

      if (paymentEntity) {
        console.log(`✅ Payment Captured: ${paymentEntity.id}`);

        await this.razorpayService.markPaymentAsPaid(
          paymentEntity.order_id,
          paymentEntity.id,
        );
      }
    }

    res.status(200).send('Webhook received');
  }
}
