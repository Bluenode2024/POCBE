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
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '모든 유저 목록 조회 ',
    description: '등록된 유저의 목록을 조회합니다.',
  })
  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

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

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '로그인한 사용자의 정보 조회 ',
    description: '현재 로그인한 사용자의 정보를 조회합니다.',
  })
  @Get('myinfo')
  async getMyInfo(@Request() req) {
    const userId = req.user.userId;
    return this.userService.getMyInfo(userId);
  }
}
