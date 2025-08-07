export interface PaymentResponseDto {
  id: number;
  userId: number;
  orderId: string;
  paymentId?: string;
  amount: string;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  receipt?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    referral_code: string;
  } | null;
}

export interface PaymentStatsDto {
  totalPayments: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  failedAmount: number;
  refundedAmount: number;
}
