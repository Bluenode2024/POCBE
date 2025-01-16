import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Post('grant-admin-role/:userId')
  async grantAdminRole(@Param('userId') userId: string, @Request() req) {
    const adminId = req.user.userId;
    return this.adminService.grantAdminRole(userId, adminId);
  }

  // @Post('grant-role')
  // async grantAdminRole(
  //   @Body()
  //   data: {
  //     granterId: string;
  //     newAdminId: string;
  //     walletAddress: string;
  //     isInitialAdmin?: boolean;
  //   },
  // ) {
  //   return this.adminService.grantAdminRole(
  //     data.granterId,
  //     data.newAdminId,
  //     data.walletAddress,
  //     data.isInitialAdmin,
  //   );
  // }

  @Post('approve-user/:userId')
  async approveUser(
    @Param('userId') userId: string,
    @Body() data: { adminId: string },
  ) {
    return this.adminService.approveUserRegistration(userId, data.adminId);
  }

  @Post('close-project/:projectId')
  async closeProject(
    @Param('projectId') projectId: string,
    @Body() data: { adminId: string },
  ) {
    return this.adminService.closeProject(projectId, data.adminId);
  }

  @Get('approve-user-request')
  async approveUserRequest() {
    return this.adminService.approveUserList();
  }

  // @Get('report')
  // async getReportList() {
  //   return this.adminService.reportList();
  // }
}
