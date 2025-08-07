import {
  IsString,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
  IsOptional,
  IsNumber,
  IsIn,
} from 'class-validator';

export class CreateBankDetailsDto {
  @IsString()
  @IsNotEmpty({ message: 'Bank name is required' })
  @MaxLength(255, { message: 'Bank name cannot exceed 255 characters' })
  bankName: string;

  @IsString()
  @IsNotEmpty({ message: 'Account number is required' })
  @Matches(/^\d{9,18}$/, { message: 'Account number must be 9-18 digits' })
  accountNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'IFSC code is required' })
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message:
      'Invalid IFSC code format. Must be 4 letters + 0 + 6 alphanumeric characters',
  })
  ifscCode: string;

  @IsString()
  @IsNotEmpty({ message: 'Account holder name is required' })
  @MaxLength(255, {
    message: 'Account holder name cannot exceed 255 characters',
  })
  @MinLength(2, {
    message: 'Account holder name must be at least 2 characters',
  })
  accountHolderName: string;

  @IsOptional()
  @IsNumber({}, { message: 'Redeem amount must be a number' })
  redeemAmount?: number;

  @IsOptional()
  @IsIn(['processing', 'deposited'], {
    message: 'Redeem status must be either processing or deposited',
  })
  redeemStatus?: 'processing' | 'deposited';
}

export class UpdateBankDetailsDto {
  @IsString()
  @IsNotEmpty({ message: 'Bank name is required' })
  @MaxLength(255, { message: 'Bank name cannot exceed 255 characters' })
  bankName: string;

  @IsString()
  @IsNotEmpty({ message: 'Account number is required' })
  @Matches(/^\d{9,18}$/, { message: 'Account number must be 9-18 digits' })
  accountNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'IFSC code is required' })
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message:
      'Invalid IFSC code format. Must be 4 letters + 0 + 6 alphanumeric characters',
  })
  ifscCode: string;

  @IsString()
  @IsNotEmpty({ message: 'Account holder name is required' })
  @MaxLength(255, {
    message: 'Account holder name cannot exceed 255 characters',
  })
  @MinLength(2, {
    message: 'Account holder name must be at least 2 characters',
  })
  accountHolderName: string;

  @IsOptional()
  @IsNumber({}, { message: 'Redeem amount must be a number' })
  redeemAmount?: number;

  @IsOptional()
  @IsIn(['processing', 'deposited'], {
    message: 'Redeem status must be either processing or deposited',
  })
  redeemStatus?: 'processing' | 'deposited';
}

export class BankDetailsResponseDto {
  id: number;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  redeemAmount: number;
  redeemStatus: 'processing' | 'deposited';
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
