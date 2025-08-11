import { Injectable } from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { cart } from '../db/schemas/cartSchema';
import { products } from '../db/schemas/productSchema';
import { users } from '../db/schemas/userSchema';
import { eq, and } from 'drizzle-orm';

// Type definitions for cart items with product and user information
type CartItemWithProductAndUser = {
  cartId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  productId: number | null;
  productName: string | null;
  productPrice: number | null;
  productStatus: string | null;
  productPhoto: string | null;
  productDescription: string | null;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
};

// Type for cart item query result
type CartItemQueryResult = {
  cartId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  productId: number | null;
  productName: string | null;
  productPrice: number | null;
  productStatus: string | null;
  productPhoto: string | null;
  productDescription: string | null;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
};

// Type for cart count query result
type CartCountQueryResult = {
  count: number;
};

// Type for cart schema result
type CartSchemaResult = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class CartService {
  // Add item to cart
  async addToCart(
    userId: number,
    productId: number,
    quantity: number = 1,
  ): Promise<CartSchemaResult[]> {
    // Check if item already exists in cart
    const existingItem: CartSchemaResult[] = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, userId), eq(cart.productId, productId)));

    if (existingItem.length > 0) {
      const existingCartItem: CartSchemaResult = existingItem[0];
      if (!existingCartItem) {
        throw new Error('Failed to get existing cart item');
      }

      // Update quantity if item already exists
      const result = await db
        .update(cart)
        .set({
          quantity: (existingCartItem.quantity || 0) + quantity,
          updated_at: new Date(),
        })
        .where(and(eq(cart.userId, userId), eq(cart.productId, productId)))
        .returning();
      return result;
    } else {
      // Add new item to cart
      const result = await db
        .insert(cart)
        .values({
          userId,
          productId,
          quantity,
        })
        .returning();
      return result;
    }
  }

  // Get cart items for a user
  async getCartByUserId(userId: number): Promise<CartItemWithProductAndUser[]> {
    const result = (await db
      .select({
        cartId: cart.id,
        quantity: cart.quantity,
        createdAt: cart.created_at,
        updatedAt: cart.updated_at,
        productId: products.id,
        productName: products.productName,
        productPrice: products.productPrice,
        productStatus: products.productStatus,
        productPhoto: products.photo,
        productDescription: products.description,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
      })
      .from(cart)
      .leftJoin(products, eq(cart.productId, products.id))
      .leftJoin(users, eq(cart.userId, users.id))
      .where(eq(cart.userId, userId))) as CartItemQueryResult[];

    return result.map((item: CartItemQueryResult) => ({
      cartId: item.cartId,
      quantity: item.quantity,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      productStatus: item.productStatus,
      productPhoto: item.productPhoto,
      productDescription: item.productDescription,
      userId: item.userId,
      userName: item.userName,
      userEmail: item.userEmail,
    }));
  }

  // Update quantity of an item in cart
  async updateCartItemQuantity(
    cartId: number,
    userId: number,
    quantity: number,
  ): Promise<CartSchemaResult[]> {
    const result = (await db
      .update(cart)
      .set({
        quantity,
        updated_at: new Date(),
      })
      .where(and(eq(cart.id, cartId), eq(cart.userId, userId)))
      .returning()) as CartSchemaResult[];
    return result;
  }

  // Remove item from cart
  async removeFromCart(
    cartId: number,
    userId: number,
  ): Promise<CartSchemaResult[]> {
    const result = (await db
      .delete(cart)
      .where(and(eq(cart.id, cartId), eq(cart.userId, userId)))
      .returning()) as CartSchemaResult[];
    return result;
  }

  // Clear entire cart for a user
  async clearCart(userId: number): Promise<CartSchemaResult[]> {
    const result = (await db
      .delete(cart)
      .where(eq(cart.userId, userId))
      .returning()) as CartSchemaResult[];
    return result;
  }

  // Check if product is in user's cart
  async isInCart(
    userId: number,
    productId: number,
  ): Promise<{ isInCart: boolean; cartItem: CartSchemaResult | null }> {
    const result = (await db
      .select()
      .from(cart)
      .where(
        and(eq(cart.userId, userId), eq(cart.productId, productId)),
      )) as CartSchemaResult[];
    return { isInCart: result.length > 0, cartItem: result[0] || null };
  }

  // Get cart count for a user
  async getCartCount(userId: number): Promise<{ cartCount: number }> {
    const result = (await db
      .select({ count: cart.quantity })
      .from(cart)
      .where(eq(cart.userId, userId))) as CartCountQueryResult[];

    const totalCount = result.reduce(
      (sum, item: CartCountQueryResult) => sum + (item.count || 0),
      0,
    );
    return { cartCount: totalCount };
  }

  // Get cart total price for a user
  async getCartTotal(userId: number): Promise<{ cartTotal: number }> {
    const cartItems = await this.getCartByUserId(userId);
    const total = cartItems.reduce((sum, item: CartItemWithProductAndUser) => {
      return sum + (item.productPrice || 0) * (item.quantity || 0);
    }, 0);
    return { cartTotal: total };
  }
}
