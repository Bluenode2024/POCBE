import { Controller, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Patch(':userId')
  async updateUserStatus(@Param('userId') memberId: string, @Request() req) {
    const userId = req.user.userId;
    return this.userService.userStatusUpdate(memberId, userId);
  }
}
