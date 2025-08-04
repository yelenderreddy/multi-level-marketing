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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
  ) {}

  @Post('/add-multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add multiple products' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productName: { type: 'string', example: 'Sample Product' },
              productCount: { type: 'number', example: 100 },
              productCode: { type: 'number', example: 12345 },
              productPrice: { type: 'number', example: 999.99 },
              description: { type: 'string', example: 'Product description' },
            },
            required: ['productName', 'productCount', 'productCode', 'productPrice'],
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Products added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - products array is required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @Post('/add-with-photo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a single product with photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productName: { type: 'string', example: 'Sample Product' },
        productCount: { type: 'number', example: 100 },
        productCode: { type: 'number', example: 12345 },
        productPrice: { type: 'number', example: 999.99 },
        description: { type: 'string', example: 'Product description' },
        photo: {
          type: 'string',
          format: 'binary',
          description: 'Product photo (max 5MB, formats: png, jpeg, jpg, gif, webp)',
        },
      },
      required: ['productName', 'productCount', 'productCode', 'productPrice'],
    },
  })
  @ApiResponse({ status: 201, description: 'Product added successfully with photo' })
  @ApiResponse({ status: 400, description: 'Bad request - required fields missing' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('photo', { storage: diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }) }))
  async addProductWithPhoto(
    @Body() productData: {
      productName: string;
      productCount: number;
      productCode: number;
      productPrice: number;
      description?: string;
    },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    photoFile?: Express.Multer.File,
  ) {
    if (!productData.productName || !productData.productCount || !productData.productCode || !productData.productPrice) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Product name, count, code, and price are required',
        data: null,
      });
    }

    return this.productService.addProductWithPhoto(productData, photoFile);
  }

  @Get('/all')
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid product ID' })
  @ApiResponse({ status: 404, description: 'Product not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Order a product' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
        productName: { type: 'string', example: 'Sample Product' },
        quantity: { type: 'number', example: 1 },
      },
      required: ['userId', 'productName'],
    },
  })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - userId and productName required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get order history for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Order history retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid userId' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOrderHistory(@Param('userId') userId: string) {
    const id = parseInt(userId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid userId');
    }

    return this.productService.getOrderHistory(id);
  }

  @Put('/order-status/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'orderId', description: 'Order ID', example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'COMPLETED', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid order ID or status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product details' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productName: { type: 'string', example: 'Updated Product Name' },
        productCount: { type: 'number', example: 150 },
        productCode: { type: 'number', example: 12346 },
        productPrice: { type: 'number', example: 1299.99 },
        description: { type: 'string', example: 'Updated description' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid product ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid product ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all order details with pagination' })
  @ApiQuery({ name: 'page', description: 'Page number', example: '1', required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', example: '10', required: false })
  @ApiResponse({ status: 200, description: 'Order details retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllOrderDetails(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    return this.productService.getAllOrderDetails(pageNum, limitNum);
  }
}
