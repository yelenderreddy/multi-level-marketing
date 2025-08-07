import { Module } from '@nestjs/common';
import { BankDetailsController } from './bankDetails.controller';
import { BankDetailsService } from './bankDetails.service';

@Module({
  controllers: [BankDetailsController],
  providers: [BankDetailsService],
  exports: [BankDetailsService],
})
export class BankDetailsModule {}
