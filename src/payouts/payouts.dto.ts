export interface CreatePayoutDto {
  userId: number;
  payoutId: string;
  amount: number;
  method: string;
  status?: 'pending' | 'completed' | 'failed' | 'processing';
  description: string;
  bankDetails: string;
  transactionId?: string;
}

export interface UpdatePayoutDto {
  status?: 'pending' | 'completed' | 'failed' | 'processing';
  transactionId?: string;
  description?: string;
}

export interface PayoutResponseDto {
  id: number;
  userId: number;
  payoutId: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  description: string;
  bankDetails: string;
  transactionId?: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
  user?: {
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    referral_code: string;
  };
}
