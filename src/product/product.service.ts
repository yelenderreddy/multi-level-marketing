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

@Injectable()
export class ProductService {
  //add products
  async addProducts(
    productList: { productName: string; productCount: number;productCode:number;productPrice:number }[],
  ): Promise<{ statusCode: number; message: string; data?: any }> {
    try {
      if (!productList || !Array.isArray(productList) || productList.length === 0) {
        throw new HttpException('Products array is required', HttpStatus.BAD_REQUEST);
      }

      // Validate each product
      for (const p of productList) {
        if (!p.productName || p.productCount < 0 || !p.productCode  || !p.productPrice) {
          throw new HttpException(
            'Invalid productName or productCount or productCode or productPricein one or more products',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const result = await db
        .insert(products)
        .values(productList)
        .returning();

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Products created successfully',
        data: result,
      };
    } catch (error) {
      console.error(error);

      throw new InternalServerErrorException(
        error?.message || 'Failed to create products',
      );
    }
  }

  //get all products
  async getAllProducts(): Promise<{ statusCode: number; message: string; data: any[] }> {
    try {
      const result = await db
        .select()
        .from(products)
        .orderBy(desc(products.created_at));

      if (!result || result.length === 0) {
        throw new NotFoundException('No products found');
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Products fetched successfully',
        data: result,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch products',
      );
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
      throw new HttpException('Product name and userId are required', HttpStatus.BAD_REQUEST);
    }

    const result = await db
      .select()
      .from(products)
      .where(eq(products.productName, productName));

    if (!result || result.length === 0) {
      throw new NotFoundException(`Product "${productName}" not found`);
    }

    const product = result[0];

    if (product.productCount < quantity) {
      throw new HttpException(
        `Only ${product.productCount} units of "${productName}" are available`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // decrement the count
    await db
      .update(products)
      .set({ productCount: product.productCount - quantity })
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
        remainingStock: product.productCount - quantity,
      },
    };
  } catch (error) {
    console.error(error);
    throw new InternalServerErrorException(
      error?.message || 'Failed to order product',
    );
  }
}

  //get order history
  async getOrderHistory(userId: number) {
  const orders = await db
    .select()
    .from(orderHistory)
    .where(eq(orderHistory.userId, userId))
    .orderBy(desc(orderHistory.orderedAt));

  return {
    statusCode: HttpStatus.OK,
    message: `Order history for user ${userId}`,
    data: orders,
  };
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
      return {
        statusCode: HttpStatus.OK,
        message: 'Order status updated successfully',
        data: result[0],
      };
    } catch (error) {
      throw new InternalServerErrorException(error?.message || 'Failed to update order status');
    }
  }

  async getProductById(productId: number): Promise<{ statusCode: number; message: string; data?: any }> {
    try {
      const result = await db.select().from(products).where(eq(products.id, productId));
      if (!result || result.length === 0) {
        throw new NotFoundException('Product not found');
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Product fetched successfully',
        data: result[0],
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch product',
      );
    }
  }

  async updateProduct(productId: number, updates: Record<string, any>): Promise<{ statusCode: number; message: string; data?: any }> {
    try {
      if (!updates || Object.keys(updates).length === 0) {
        throw new HttpException('No update fields provided', HttpStatus.BAD_REQUEST);
      }
      const result = await db
        .update(products)
        .set(updates)
        .where(eq(products.id, productId))
        .returning();
      if (!result || result.length === 0) {
        throw new NotFoundException('Product not found');
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Product updated successfully',
        data: result[0],
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to update product',
      );
    }
  }

  async deleteProduct(productId: number): Promise<{ statusCode: number; message: string; data?: any }> {
    try {
      // Check if product exists
      const product = await db.select().from(products).where(eq(products.id, productId));
      if (!product || product.length === 0) {
        throw new NotFoundException('Product not found');
      }

      // Delete the product
      const deletedRows = await db.delete(products).where(eq(products.id, productId)).returning();

      return {
        statusCode: HttpStatus.OK,
        message: 'Product deleted successfully',
        data: deletedRows[0], // optional: return deleted product info
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to delete product',
      );
    }
  }

  // Get all order details with user and product details
  async getAllOrderDetails(
    page: number = 1,
    limit: number = 10
  ): Promise<{ statusCode: number; message: string; data: any }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const totalCount = await db
        .select({ count: orderHistory.id })
        .from(orderHistory);

      // Get paginated order details with user and product information
      const result = await db
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
        .offset(offset);

      if (!result || result.length === 0) {
        throw new NotFoundException('No order history found');
      }

      const total = totalCount.length;
      const totalPages = Math.ceil(total / limit);

      return {
        statusCode: HttpStatus.OK,
        message: 'Order details fetched successfully',
        data: {
          orders: result,
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
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch order details',
      );
    }
  }

}
