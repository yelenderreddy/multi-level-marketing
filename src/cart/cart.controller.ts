import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Put,
} from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add/:userId')
  async addToCart(
    @Param('userId') userId: number,
    @Body() body: { productId: number; quantity?: number },
  ) {
    return this.cartService.addToCart(
      userId,
      body.productId,
      body.quantity || 1,
    );
  }

  @Get('getCartItems/:userId')
  async getCartItems(@Param('userId') userId: number) {
    return this.cartService.getCartByUserId(userId);
  }

  @Put('updateQuantity/:cartId/:userId')
  async updateQuantity(
    @Param('cartId') cartId: number,
    @Param('userId') userId: number,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateCartItemQuantity(
      cartId,
      userId,
      body.quantity,
    );
  }

  @Delete('remove/:cartId/:userId')
  async removeFromCart(
    @Param('cartId') cartId: number,
    @Param('userId') userId: number,
  ) {
    return this.cartService.removeFromCart(cartId, userId);
  }

  @Delete('clear/:userId')
  async clearCart(@Param('userId') userId: number) {
    return this.cartService.clearCart(userId);
  }

  @Get('check/:userId/:productId')
  async isInCart(
    @Param('userId') userId: number,
    @Param('productId') productId: number,
  ) {
    return this.cartService.isInCart(userId, productId);
  }

  @Get('count/:userId')
  async getCartCount(@Param('userId') userId: number) {
    return this.cartService.getCartCount(userId);
  }

  @Get('total/:userId')
  async getCartTotal(@Param('userId') userId: number) {
    return this.cartService.getCartTotal(userId);
  }
}
