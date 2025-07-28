import {
  Body,
  Controller,
  Post,
  Get,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('/add-multiple')
  async addProducts(
    @Body() body: { products: { productName: string; productCount: number;productCode:number;productPrice:number }[] },
  ) {
    const { products } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'products array is required',
        data: null,
      });
    }

    return this.productService.addProducts(products);
  }

  @Get('/all')
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get('/:id')
  async getProductById(@Param('id') id: string) {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid product ID',
        data: null,
      });
    }
    return this.productService.getProductById(productId);
  }

  @Post('/order')
async orderProduct(@Body() body: { userId: number, productName: string, quantity?: number }) {
  const { userId, productName, quantity } = body;

  if (!userId || !productName) {
    throw new BadRequestException({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'userId and productName are required',
      data: null,
    });
  }

  return this.productService.orderProduct(userId, productName, quantity || 1);
}
@Get('/order-history/:userId')
async getOrderHistory(@Param('userId') userId: string) {
  const id = parseInt(userId, 10);
  if (isNaN(id)) {
    throw new BadRequestException('Invalid userId');
  }

  return this.productService.getOrderHistory(id);
}

  @Post('/update/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updates: Record<string, any>,
  ) {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid product ID',
        data: null,
      });
    }
    return this.productService.updateProduct(productId, updates);
  }

}
