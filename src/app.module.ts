import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RazorpayModule } from './razorpay/razorpay.module';

import { ProductModule } from './product/product.module';
import { FaqService } from './faq/faq.service';
import { FaqModule } from './faq/faq.module';
import { AdminModule } from './admin/admin.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { BankDetailsModule } from './bankDetails/bankDetails.module';
import { CartModule } from './cart/cart.module';
import { PayoutsModule } from './payouts/payouts.module';
import { PaymentsModule } from './payments/payments.module';
import { TermsModule } from './terms/terms.module';
import { PrivacyModule } from './privacy/privacy.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), //  enables .env and makes ConfigService available everywhere
    UsersModule,
    RazorpayModule,
    ProductModule,
    FaqModule,
    AdminModule,
    WishlistModule,
    BankDetailsModule,
    CartModule,
    PayoutsModule,
    PaymentsModule,
    TermsModule,
    PrivacyModule,
  ],
  controllers: [AppController],
  providers: [AppService, FaqService],
})
export class AppModule {}
