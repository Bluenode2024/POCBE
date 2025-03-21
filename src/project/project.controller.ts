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
import {
  CreateProjectDto,
  UpdateRepositoryDto,
  ApproveProjectDto,
} from './dto/project.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('project')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * ✅ 프로젝트 신청 (리더가 신청)
   */
  @Post()
  @ApiOperation({
    summary: '새로운 프로젝트 등록',
    description: '리더가 새로운 프로젝트를 신청합니다.',
  })
  @ApiResponse({ status: 201, description: '프로젝트 등록 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard) // JWT 인증 미들웨어 적용
  async createProject(@Body() createProjectDto: CreateProjectDto, @Req() req) {
    const leaderId = req.user.userId; // JWT에서 wallet_address 가져오기
    return this.projectService.createProject(createProjectDto, leaderId);
  }

  /**
   * ✅ 프로젝트 승인/거절
   */
  @Post('approve')
  @ApiOperation({
    summary: '프로젝트 승인/거절',
    description: '관리자가 프로젝트를 승인 또는 거절합니다.',
  })
  @ApiResponse({ status: 200, description: '프로젝트 승인/거절 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
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
  @ApiOperation({
    summary: '새로운 레포지토리 추가',
    description: '승인된 프로젝트에 GitHub 레포지토리를 추가합니다.',
  })
  @ApiResponse({ status: 201, description: '레포지토리 추가 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async insertRepository(@Body() updateRepositoryDto: UpdateRepositoryDto) {
    return this.projectService.insertRepository(updateRepositoryDto);
  }

  @Get(':id/tasks')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '프로젝트의 테스크 조회',
    description: '주어진 프로젝트id의 테스크를 조회합니다.',
  })
  async getTasksByProjectId(@Param('id') projectId: string) {
    return this.projectService.getTasksByProjectId(projectId);
  }

  @Get('task/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard) // JWT 인증 미들웨어 적용
  @ApiOperation({
    summary: '테스크 상세 조회',
    description: '주어진 테스크를 조회합니다.',
  })
  async getTaskById(@Param('id') taskId: string) {
    return this.projectService.getTaskById(taskId);
  }

  @Get('my-tasks')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard) // JWT 인증 미들웨어 적용
  @ApiOperation({
    summary: '나의 테스크 조회',
    description: '나에게 할당된 테스크를 조회합니다.',
  })
  async getMyTask(@Req() req) {
    const userId = req.user.userId;
    return this.projectService.getMyTask(userId);
  }

  @Get('my-progress')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard) // JWT 인증 미들웨어 적용
  @ApiOperation({
    summary: '나의 테스크 목록 조회',
    description: '나에게 할당된 테스크의 진행도를 조회합니다.',
  })
  async getMyTaskProgress(@Req() req) {
    const userId = req.user.userId;

    return this.projectService.getMyTaskProgress(userId);
  }

  @Get(':id/progess')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard) // JWT 인증 미들웨어 적용
  @ApiOperation({
    summary: '프로젝트 진행률 조회',
    description: '프로젝트의 진행률을 조회합니다.',
  })
  async getProjectProgressById(@Param('id') projectId: string) {
    return this.projectService.getProjectProgressById(projectId);
  }

  /**
   * ✅ 특정 상태의 프로젝트 조회
   */
  @Get('status/:status')
  @UseGuards(AuthGuard) // JWT 인증 미들웨어 적용
  @ApiOperation({
    summary: '프로젝트 상태별 조회',
    description: '특정 상태의 프로젝트 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '프로젝트 조회 성공' })
  @ApiResponse({ status: 404, description: '프로젝트가 존재하지 않음' })
  async getProjectsByStatus(@Param('status') status: string) {
    return this.projectService.getProjectsByStatus(status);
  }

  /**
   * ✅ 사용자가 현재 참여중인 모든 프로젝트 조회
   */

  @Get('myproject')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard) // JWT 인증 미들웨어 적용
  @ApiOperation({
    summary: '사용자가 현재 참여중인 모든 프로젝트 목록 조회 ',
    description: '사용자 본인이 현재 참여중인 프로젝트 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '프로젝트 조회 성공' })
  @ApiResponse({ status: 404, description: '프로젝트가 존재하지 않음' })
  async getMyProjects(@Req() req) {
    const userId = req.user.userId;
    return this.projectService.getMyProjects(userId);
  }
}
