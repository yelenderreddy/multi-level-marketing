import { Injectable } from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { cart } from '../db/schemas/cartSchema';
import { products } from '../db/schemas/productSchema';
import { users } from '../db/schemas/userSchema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class CartService {
  // Add item to cart
  async addToCart(userId: number, productId: number, quantity: number = 1) {
    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, userId), eq(cart.productId, productId)));

    if (existingItem.length > 0) {
      // Update quantity if item already exists
      const result = await db
        .update(cart)
        .set({ 
          quantity: existingItem[0].quantity + quantity,
          updated_at: new Date()
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
  async getCartByUserId(userId: number) {
    const result = await db
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
      .where(eq(cart.userId, userId));
    return result;
  }

  // Update quantity of an item in cart
  async updateCartItemQuantity(cartId: number, userId: number, quantity: number) {
    const result = await db
      .update(cart)
      .set({ 
        quantity,
        updated_at: new Date()
      })
      .where(and(eq(cart.id, cartId), eq(cart.userId, userId)))
      .returning();
    return result;
  }

  // Remove item from cart
  async removeFromCart(cartId: number, userId: number) {
    const result = await db
      .delete(cart)
      .where(and(eq(cart.id, cartId), eq(cart.userId, userId)))
      .returning();
    return result;
  }

  // Clear entire cart for a user
  async clearCart(userId: number) {
    const result = await db
      .delete(cart)
      .where(eq(cart.userId, userId))
      .returning();
    return result;
  }

  // Check if product is in user's cart
  async isInCart(userId: number, productId: number) {
    const result = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, userId), eq(cart.productId, productId)));
    return { isInCart: result.length > 0, cartItem: result[0] || null };
  }

  // Get cart count for a user
  async getCartCount(userId: number) {
    const result = await db
      .select({ count: cart.quantity })
      .from(cart)
      .where(eq(cart.userId, userId));
    
    const totalCount = result.reduce((sum, item) => sum + item.count, 0);
    return { cartCount: totalCount };
  }

  // Get cart total price for a user
  async getCartTotal(userId: number) {
    const cartItems = await this.getCartByUserId(userId);
    const total = cartItems.reduce((sum, item) => {
      return sum + ((item.productPrice || 0) * item.quantity);
    }, 0);
    return { cartTotal: total };
  }
} 