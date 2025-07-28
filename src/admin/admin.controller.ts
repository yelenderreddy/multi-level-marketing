import { Controller, Post, Body, HttpStatus, UnauthorizedException, Get, Param } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from './admin.service';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly jwtService: JwtService, private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    // Hardcoded admin credentials
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const payload = { sub: 'admin', username: 'admin' };
      const token = this.jwtService.sign(payload);
      return {
        statusCode: HttpStatus.OK,
        message: 'logged in successful',
        token,
      };
    }
    throw new UnauthorizedException({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'details are invalid',
    });
  }

  @Post('reward-target')
  async addRewardTarget(@Body() body: { referralCount: number; reward: string }) {
    const { referralCount, reward } = body;
    if (typeof referralCount !== 'number' || !reward) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'referralCount (number) and reward (string) are required',
      });
    }
    return this.adminService.addRewardTarget(referralCount, reward);
  }

  @Get('reward-targets')
  async getAllRewardTargets() {
    return this.adminService.getAllRewardTargets();
  }

  @Post('reward-target/update/:id')
  async updateRewardTarget(
    @Param('id') id: string,
    @Body() updates: Record<string, any>,
  ) {
    const targetId = parseInt(id, 10);
    if (isNaN(targetId)) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid reward target ID',
      });
    }
    return this.adminService.updateRewardTarget(targetId, updates);
  }
} 