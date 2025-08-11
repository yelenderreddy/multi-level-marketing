import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UnauthorizedException,
  Get,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
  ) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
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
  @UseGuards(JwtAuthGuard)
  async addRewardTarget(
    @Body() body: { referralCount: number; reward: string; target: string },
  ) {
    const { referralCount, reward, target } = body;
    if (typeof referralCount !== 'number' || !reward) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'referralCount (number) and reward (string) are required',
      });
    }
    return this.adminService.addRewardTarget(referralCount, reward, target);
  }

  @Get('getAll-reward-targets')
  @UseGuards(JwtAuthGuard)
  async getAllRewardTargets() {
    return this.adminService.getAllRewardTargets();
  }

  @Post('reward-target/update/:id')
  @UseGuards(JwtAuthGuard)
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

  @Delete('reward-target/:id')
  @UseGuards(JwtAuthGuard)
  async deleteRewardTarget(@Param('id') id: string) {
    const targetId = parseInt(id, 10);
    if (isNaN(targetId)) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid reward target ID',
      });
    }
    return this.adminService.deleteRewardTarget(targetId);
  }

  @Get('users-by-referral-count/:count')
  @UseGuards(JwtAuthGuard)
  async getUsersByReferralCountWithReferred(
    @Param('count') count: string,
    @Body() body: { page?: number; pageSize?: number } = {},
  ) {
    const referralCount = parseInt(count, 10);
    if (isNaN(referralCount)) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid referralCount',
      });
    }
    const { page = 1, pageSize = 10 } = body || {};
    return this.adminService.getUsersByReferralCountWithReferred(
      referralCount,
      page,
      pageSize,
    );
  }

  @Post('approve-reward/:userId')
  @UseGuards(JwtAuthGuard)
  async approveUserReward(
    @Param('userId') userId: string,
    @Body() body: { reward: string; status?: string },
  ) {
    const id = parseInt(userId, 10);
    if (isNaN(id)) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid user ID',
      });
    }
    const { reward, status } = body;
    if (!reward && !status) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Reward or status is required',
      });
    }
    return this.adminService.approveUserReward(id, reward, status);
  }

  // Dashboard Statistics Endpoints
  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard)
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/total-users')
  @UseGuards(JwtAuthGuard)
  async getTotalUsersCount() {
    return this.adminService.getTotalUsersCount();
  }

  @Get('dashboard/daily-joins')
  @UseGuards(JwtAuthGuard)
  async getDailyJoinsCount() {
    return this.adminService.getDailyJoinsCount();
  }
}
