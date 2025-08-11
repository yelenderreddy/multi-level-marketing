import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { products } from '../db/schemas/productSchema';
import { users } from '../db/schemas/userSchema';
import { desc, eq } from 'drizzle-orm';
import { orderHistory } from 'src/db/schemas/orderHistorySchema';
import { FileUploadService } from './file-upload.service';

// Type for database query results
type OrderDetailsQueryResult = {
  id: number;
  userId: number;
  productId: number;
  productName: string;
  quantity: number;
  status: string;
  orderedAt: Date;
  userName: string | null;
  userEmail: string | null;
  userMobile: string | null;
  userAddress: string | null;
  userGender: string | null;
  userReferralCode: string | null;
  userPaymentStatus: string | null;
  productPrice: number | null;
  productCount: number | null;
  productStatus: string | null;
  productCode: number | null;
};

type TotalCountQueryResult = {
  count: number;
};

@Injectable()
export class ProductService {
  constructor(private readonly fileUploadService: FileUploadService) {}
  //add products
  async addProducts(
    productList: {
      productName: string;
      productCount: number;
      productCode: number;
      productPrice: number;
      description?: string;
      photo?: string;
    }[],
  ): Promise<{ statusCode: number; message: string; data?: any }> {
    try {
      if (
        !productList ||
        !Array.isArray(productList) ||
        productList.length === 0
      ) {
        throw new HttpException(
          'Products array is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate each product
      for (const p of productList) {
        if (
          !p.productName ||
          p.productCount < 0 ||
          !p.productCode ||
          !p.productPrice
        ) {
          throw new HttpException(
            'Invalid productName or productCount or productCode or productPricein one or more products',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const result = await db.insert(products).values(productList).returning();

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Products created successfully',
        data: result,
      };
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to create products',
        );
      }
      throw new InternalServerErrorException('Failed to create products');
    }
  }

  //add single product with photo
  async addProductWithPhoto(
    productData: {
      productName: string;
      productCount: number;
      productCode: number;
      productPrice: number;
      description?: string;
    },
    photoFile?: Express.Multer.File,
  ): Promise<{ statusCode: number; message: string; data?: any }> {
    try {
      if (
        !productData.productName ||
        productData.productCount < 0 ||
        !productData.productCode ||
        !productData.productPrice
      ) {
        throw new HttpException(
          'Invalid product data provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      let photoFilename: string | null = null;
      if (photoFile) {
        photoFilename = photoFile.filename;
      }

      const productToInsert = {
        ...productData,
        photo: photoFilename,
      };

      const result = await db
        .insert(products)
        .values(productToInsert)
        .returning();

      // Add photo URL to the response
      const productWithPhotoUrl = result.map((product) => ({
        ...product,
        photoUrl: product.photo
          ? this.fileUploadService.getFileUrl(product.photo)
          : null,
      }));

      const createdProduct = productWithPhotoUrl[0];
      if (!createdProduct) {
        throw new InternalServerErrorException('Failed to create product');
      }

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Product created successfully',
        data: createdProduct,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to create product',
        );
      }
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  //get all products
  async getAllProducts(): Promise<{
    statusCode: number;
    message: string;
    data: any[];
  }> {
    try {
      const result = await db
        .select()
        .from(products)
        .orderBy(desc(products.created_at));

      // Add photo URLs to each product
      const productsWithPhotoUrls = result.map((product) => ({
        ...product,
        photoUrl: product.photo
          ? this.fileUploadService.getFileUrl(product.photo)
          : null,
      }));

      return {
        statusCode: HttpStatus.OK,
        message:
          result.length === 0
            ? 'No products found'
            : 'Products fetched successfully',
        data: productsWithPhotoUrls,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to fetch products',
        );
      }
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  //order product
  async orderProduct(
    userId: number,
    productName: string,
    quantity: number = 1,
  ): Promise<{ statusCode: number; message: string; data?: any }> {
    try {
      if (!productName || !userId) {
        throw new HttpException(
          'Product name and userId are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await db
        .select()
        .from(products)
        .where(eq(products.productName, productName));

      if (!result || result.length === 0) {
        throw new NotFoundException(`Product "${productName}" not found`);
      }

      const product = result[0];
      if (!product) {
        throw new NotFoundException(`Product "${productName}" not found`);
      }

      if ((product.productCount || 0) < quantity) {
        throw new HttpException(
          `Only ${product.productCount || 0} units of "${productName}" are available`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // decrement the count
      await db
        .update(products)
        .set({ productCount: (product.productCount || 0) - quantity })
        .where(eq(products.id, product.id));

      // record in order_history
      await db.insert(orderHistory).values({
        userId,
        productId: product.id,
        productName: product.productName,
        quantity,
        status: 'confirmed',
      });

      return {
        statusCode: HttpStatus.OK,
        message: `Order placed for "${productName}"`,
        data: {
          productId: product.id,
          productName: product.productName,
          productPrice: product.productPrice,
          orderedQuantity: quantity,
          remainingStock: (product.productCount || 0) - quantity,
        },
      };
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to order product',
        );
      }
      throw new InternalServerErrorException('Failed to order product');
    }
  }

  //get order history
  async getOrderHistory(userId: number) {
    try {
      // First, get all orders for the user
      const orders = await db
        .select({
          id: orderHistory.id,
          userId: orderHistory.userId,
          productId: orderHistory.productId,
          productName: orderHistory.productName,
          quantity: orderHistory.quantity,
          status: orderHistory.status,
          orderedAt: orderHistory.orderedAt,
        })
        .from(orderHistory)
        .where(eq(orderHistory.userId, userId))
        .orderBy(desc(orderHistory.orderedAt));

      // Transform orders to include product prices
      const transformedOrders = await Promise.all(
        orders.map(async (order) => {
          let productPrice = 0;
          try {
            const productResult = await db
              .select({ productPrice: products.productPrice })
              .from(products)
              .where(eq(products.id, order.productId))
              .limit(1);

            if (productResult.length > 0 && productResult[0]) {
              productPrice = productResult[0].productPrice || 0;
            }
          } catch (error) {
            console.error(
              `Error fetching product price for productId ${order.productId}:`,
              error,
            );
          }

          return {
            ...order,
            productPrice: productPrice,
          };
        }),
      );

      return {
        statusCode: HttpStatus.OK,
        message: `Order history for user ${userId}`,
        data: transformedOrders,
      };
    } catch (error) {
      console.error('Error fetching order history:', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to fetch order history',
        );
      }
      throw new InternalServerErrorException('Failed to fetch order history');
    }
  }

  async updateOrderStatus(orderId: number, status: string) {
    try {
      const result = await db
        .update(orderHistory)
        .set({ status })
        .where(eq(orderHistory.id, orderId))
        .returning();
      if (!result || result.length === 0) {
        throw new NotFoundException('Order not found');
      }
      const updatedOrder = result[0];
      if (!updatedOrder) {
        throw new NotFoundException('Order not found');
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Order status updated successfully',
        data: updatedOrder,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to update order status',
        );
      }
      throw new InternalServerErrorException('Failed to update order status');
    }
  }

  async getProductById(
    productId: number,
  ): Promise<{ statusCode: number; message: string; data?: any }> {
    try {
      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));

      if (!result || result.length === 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Product not found',
          data: null,
        };
      }

      const product = result[0];
      if (!product) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Product not found',
          data: null,
        };
      }

      // Add photo URL to the product
      const productWithPhotoUrl = {
        ...product,
        photoUrl: product.photo
          ? this.fileUploadService.getFileUrl(product.photo)
          : null,
      };

      return {
        statusCode: HttpStatus.OK,
        message: 'Product fetched successfully',
        data: productWithPhotoUrl,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to fetch product',
        );
      }
      throw new InternalServerErrorException('Failed to fetch product');
    }
  }

  async updateProduct(
    productId: number,
    updates: Record<string, any>,
  ): Promise<{ statusCode: number; message: string; data?: any }> {
    try {
      if (!updates || Object.keys(updates).length === 0) {
        throw new HttpException(
          'No update fields provided',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await db
        .update(products)
        .set(updates)
        .where(eq(products.id, productId))
        .returning();

      if (!result || result.length === 0) {
        throw new NotFoundException('Product not found');
      }

      const updatedProduct = result[0];
      if (!updatedProduct) {
        throw new NotFoundException('Product not found');
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Product updated successfully',
        data: updatedProduct,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to update product',
        );
      }
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async deleteProduct(
    productId: number,
  ): Promise<{ statusCode: number; message: string; data?: any }> {
    try {
      // Check if product exists
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));
      if (!product || product.length === 0) {
        throw new NotFoundException('Product not found');
      }

      const productData = product[0];
      if (!productData) {
        throw new NotFoundException('Product not found');
      }

      // Delete the photo file if it exists
      if (productData.photo) {
        await this.fileUploadService.deleteFile(productData.photo);
      }

      // Delete the product
      const deletedRows = await db
        .delete(products)
        .where(eq(products.id, productId))
        .returning();

      const deletedProduct = deletedRows[0];
      if (!deletedProduct) {
        throw new NotFoundException('Product not found');
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Product deleted successfully',
        data: deletedProduct, // optional: return deleted product info
      };
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to delete product',
        );
      }
      throw new InternalServerErrorException('Failed to delete product');
    }
  }

  // Get all order details with user and product details
  async getAllOrderDetails(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ statusCode: number; message: string; data: any }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const totalCount = (await db
        .select({ count: orderHistory.id })
        .from(orderHistory)) as TotalCountQueryResult[];

      // Get paginated order details with user and product information
      const result = (await db
        .select({
          id: orderHistory.id,
          userId: orderHistory.userId,
          productId: orderHistory.productId,
          productName: orderHistory.productName,
          quantity: orderHistory.quantity,
          status: orderHistory.status,
          orderedAt: orderHistory.orderedAt,
          // User details
          userName: users.name,
          userEmail: users.email,
          userMobile: users.mobileNumber,
          userAddress: users.address,
          userGender: users.gender,
          userReferralCode: users.referral_code,
          userPaymentStatus: users.payment_status,
          // Product details
          productPrice: products.productPrice,
          productCount: products.productCount,
          productStatus: products.productStatus,
          productCode: products.productCode,
        })
        .from(orderHistory)
        .leftJoin(users, eq(orderHistory.userId, users.id))
        .leftJoin(products, eq(orderHistory.productId, products.id))
        .orderBy(desc(orderHistory.orderedAt))
        .limit(limit)
        .offset(offset)) as OrderDetailsQueryResult[];

      const total = totalCount.length;
      const totalPages = Math.ceil(total / limit);

      return {
        statusCode: HttpStatus.OK,
        message:
          result.length === 0
            ? 'No order history found'
            : 'Order details fetched successfully',
        data: {
          orders: result.map((item) => ({
            id: item.id,
            userId: item.userId,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            status: item.status,
            orderedAt: item.orderedAt,
            userName: item.userName,
            userEmail: item.userEmail,
            userMobile: item.userMobile,
            userAddress: item.userAddress,
            userGender: item.userGender,
            userReferralCode: item.userReferralCode,
            userPaymentStatus: item.userPaymentStatus,
            productPrice: item.productPrice,
            productCount: item.productCount,
            productStatus: item.productStatus,
            productCode: item.productCode,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message || 'Failed to fetch order details',
        );
      }
      throw new InternalServerErrorException('Failed to fetch order details');
    }
  }
}
