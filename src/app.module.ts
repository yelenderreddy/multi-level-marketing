import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RazorpayModule } from './razorpay/razorpay.module';
import { ProductService } from './product/product.service';
import { ProductModule } from './product/product.module';
import { FaqService } from './faq/faq.service';
import { FaqModule } from './faq/faq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 👈 enables .env and makes ConfigService available everywhere
    UsersModule,
    RazorpayModule,
    ProductModule,
    FaqModule,
  ],
  controllers: [AppController],
  providers: [AppService, ProductService, FaqService],
})
export class AppModule {}
