import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('add/:userId')
  async addToWishlist(
    @Param('userId') userId: number,
    @Body() product: any
  ) {
    return this.wishlistService.addToWishlist(userId, product);
  }

  @Get(':userId')
  async getWishlist(@Param('userId') userId: number) {
    return this.wishlistService.getWishlistByUserId(userId);
  }
}
