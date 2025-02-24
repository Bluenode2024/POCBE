import {
  Controller,
  Param,
  Patch,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Patch(':userId')
  async updateUserStatus(@Param('userId') memberId: string, @Request() req) {
    const userId = req.user.userId;
    return this.userService.userStatusUpdate(memberId, userId);
  }

  @ApiBearerAuth('access-token')
  @Get('id/:walletAddress')
  async getUserId(@Param('walletAddress') walletAddress: string) {
    return this.userService.getUserId(walletAddress);
  }
}
