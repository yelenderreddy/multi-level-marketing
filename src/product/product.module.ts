import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { FileUploadService } from './file-upload.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, FileUploadService],
})
export class ProductModule {}
