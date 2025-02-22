import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ApproveProjectDto } from './dto/approve-project.dto';
import { UpdateRepositoryDto } from './dto/update-repository.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * ✅ 프로젝트 신청 (리더가 신청)
   */
  @Post()
  @UseGuards(AuthGuard) // JWT 인증 미들웨어 적용
  async createProject(@Body() createProjectDto: CreateProjectDto, @Req() req) {
    const walletAddress = req.user.wallet_address; // JWT에서 wallet_address 가져오기
    return this.projectService.createProject(createProjectDto, walletAddress);
  }

  /**
   * ✅ 프로젝트 승인/거절
   */
  @Post('approve')
  @UseGuards(AuthGuard) // JWT 인증 미들웨어 적용
  async approveProject(
    @Body() approveProjectDto: ApproveProjectDto,
    @Req() req,
  ) {
    return this.projectService.approveProject(approveProjectDto, req);
  }

  /**
   * ✅ 프로젝트에 새로운 레포지토리 추가 (중복 방지)
   */
  @Post('repository')
  async insertRepository(@Body() updateRepositoryDto: UpdateRepositoryDto) {
    return this.projectService.insertRepository(updateRepositoryDto);
  }

  /**
   * ✅ 특정 상태의 프로젝트 조회
   */
  @Get('status/:status')
  async getProjectsByStatus(@Param('status') status: string) {
    return this.projectService.getProjectsByStatus(status);
  }
}
