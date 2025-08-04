import {
  Body,
  Controller,
  Post,
  Get,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('/add-multiple')
  @UseGuards(JwtAuthGuard)
  async addProducts(
    @Body()
    body: {
      products: {
        productName: string;
        productCount: number;
        productCode: number;
        productPrice: number;
        description?: string;
      }[];
    },
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
  @UseGuards(JwtAuthGuard)
  async orderProduct(
    @Body() body: { userId: number; productName: string; quantity?: number },
  ) {
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
  @UseGuards(JwtAuthGuard)
  async getOrderHistory(@Param('userId') userId: string) {
    const id = parseInt(userId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid userId');
    }

    return this.productService.getOrderHistory(id);
  }

  @Put('/order-status/:orderId')
  @UseGuards(JwtAuthGuard)
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() body: { status: string },
  ) {
    const id = parseInt(orderId, 10);
    if (isNaN(id)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid order ID',
        data: null,
      });
    }
    const { status } = body;
    if (!status) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Status is required',
        data: null,
      });
    }
    return this.productService.updateOrderStatus(id, status);
  }

  @Put('/update/:id')
  @UseGuards(JwtAuthGuard)
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

  @Delete('deleteProduct/:id')
  @UseGuards(JwtAuthGuard)
  async deleteProduct(@Param('id') id: string) {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid product ID',
        data: null,
      });
    }
    return this.productService.deleteProduct(productId);
  }

  @Get('/order-details/all')
  @UseGuards(JwtAuthGuard)
  async getAllOrderDetails(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    return this.productService.getAllOrderDetails(pageNum, limitNum);
  }
}
