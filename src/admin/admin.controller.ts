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
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @ApiBearerAuth('access-token')
  @Post('grant-admin-role/:userId')
  async grantAdminRole(@Param('userId') userId: string, @Request() req) {
    const adminId = req.user.userId;
    return this.adminService.grantAdminRole(userId, adminId);
  }

  @ApiBearerAuth('access-token')
  @Post('approve-user/:userId')
  async approveUser(@Param('userId') userId: string, @Request() req) {
    const adminId = req.user.userId;
    console.log('Admin ID:', adminId);
    return this.adminService.approveUserRegistration(userId, adminId);
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
}
