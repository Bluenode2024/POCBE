import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {} // AdminService를 의존성 주입(DI)을 통해 가져온다.

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

  @Get('monitor-task-progress')
  async monitorTask() {
    return this.adminService.moniterUserTasks();
  }

  @Get('approve-user-request')
  async approveUserRequest() {
    return this.adminService.approveUserList();
  }
}
