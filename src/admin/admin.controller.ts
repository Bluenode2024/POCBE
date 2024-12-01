import { Controller, Post, Body, Param } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('grant-role')
  async grantAdminRole(
    @Body()
    data: {
      granterId: string;
      newAdminId: string;
      walletAddress: string;
      isInitialAdmin?: boolean;
    },
  ) {
    return this.adminService.grantAdminRole(
      data.granterId,
      data.newAdminId,
      data.walletAddress,
      data.isInitialAdmin,
    );
  }

  @Post('approve-user/:userId')
  async approveUser(
    @Param('userId') userId: string,
    @Body() data: { adminId: string },
  ) {
    return this.adminService.approveUserRegistration(userId, data.adminId);
  }
}
