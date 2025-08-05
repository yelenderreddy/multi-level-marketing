import { Injectable } from '@nestjs/common';
import { db } from '../db/dbConnection/db.connect';
import { wishlist } from '../db/schemas/wishlistSchema';
import { products } from '../db/schemas/productSchema';
import { users } from '../db/schemas/userSchema';
import { eq, and, type InferSelectModel } from 'drizzle-orm';

@Injectable()
export class WishlistService {
  // Add logic to handle wishlist operations
  async addToWishlist(userId: number, product: any) {
    // Insert product details and userId into wishlist table
    const result = await db
      .insert(wishlist)
      .values({
        userId,
        productId: product.productId,
        productName: product.productName,
        productPrice: product.productPrice || 0,
      })
      .returning();
    return result;
  }

  async getWishlistByUserId(userId: number) {
    // Fetch wishlist items for the user, join with products and users for full details
    const result = await db
      .select({
        wishlistId: wishlist.id,
        createdAt: wishlist.created_at,
        productId: wishlist.productId,
        productName: products.productName,
        productPrice: products.productPrice,
        productStatus: products.productStatus,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
      })
      .from(wishlist)
      .leftJoin(products, eq(wishlist.productId, products.id))
      .leftJoin(users, eq(wishlist.userId, users.id))
      .where(eq(wishlist.userId, userId));
    return result;
  }

  async removeFromWishlist(wishlistId: number, userId: number) {
    const result = await db
      .delete(wishlist)
      .where(eq(wishlist.id, wishlistId))
      .returning();
    return result;
  }

  async clearWishlist(userId: number) {
    const result = await db
      .delete(wishlist)
      .where(eq(wishlist.userId, userId))
      .returning();
    return result;
  }

  async isInWishlist(userId: number, productId: number) {
    const result = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
    return { isInWishlist: result.length > 0 };
  }
}
