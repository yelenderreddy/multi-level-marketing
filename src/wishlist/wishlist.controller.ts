import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('add/:userId')
  async addToWishlist(
    @Param('userId') userId: number,
    @Body()
    product: {
      productId: number;
      productName: string;
      productPrice?: number;
    },
  ) {
    return this.wishlistService.addToWishlist(userId, product);
  }

  @Get('getWishListProducts/:userId')
  async getWishlist(@Param('userId') userId: number) {
    return this.wishlistService.getWishlistByUserId(userId);
  }

  @Delete('remove/:wishlistId/:userId')
  async removeFromWishlist(
    @Param('wishlistId') wishlistId: number,
    @Param('userId') userId: number,
  ) {
    return this.wishlistService.removeFromWishlist(wishlistId, userId);
  }

  @Delete('clear/:userId')
  async clearWishlist(@Param('userId') userId: number) {
    return this.wishlistService.clearWishlist(userId);
  }

  @Get('check/:userId/:productId')
  async isInWishlist(
    @Param('userId') userId: number,
    @Param('productId') productId: number,
  ) {
    return this.wishlistService.isInWishlist(userId, productId);
  }
}
