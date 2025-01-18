import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateProjectRequestDto } from './dto/create-project-request';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createProject(@Body() newProject: CreateProjectDto, @Request() req) {
    const leaderId = req.user.userId;
    console.log('req.user', req.user);
    return this.projectService.createProject(
      newProject.epochId,
      newProject.title,
      newProject.description,
      newProject.volume,
      newProject.memberData,
      newProject.startDate,
      newProject.endDate,
      leaderId,
      newProject.score,
    );
  }

  @Patch(':projectId')
  async approveProject(
    @Body() data: { adminComment: string },
    @Param('projectId') projectId: string,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.projectService.approveProject(userId, data, projectId);
  }

  @Put('contribution/:projectId/members')
  async updateMemberContribution(
    @Param('projectId') projectId: string,
    @Body()
    data: {
      userId: string;
      contributionScore: number;
    },
  ) {
    return this.projectService.updateMemberProjectContribution(
      projectId,
      data.userId,
      data.contributionScore,
    );
  }

  @Put('contribution/:projectId')
  async updateContribution(
    @Param('projectId') projectId: string,
    @Body()
    data: {
      userId: string;
      contributionScore: number;
    },
  ) {
    return this.projectService.updateProjectContribution(
      projectId,
      data.userId,
      data.contributionScore,
    );
  }

  @Post('complete/:projectId')
  async completeProject(
    @Param('projectId') projectId: string,
    @Body()
    data: {
      completionStatus: number;
      verificationTxHash: string;
      ipfsHash: string;
    },
  ) {
    return this.projectService.completeProject(
      projectId,
      data.completionStatus,
      data.verificationTxHash,
      data.ipfsHash,
    );
  }

  @Post('request')
  async createProjectRequest(
    @Body() createProjectRequestDto: CreateProjectRequestDto,
  ) {
    return this.projectService.projectRequestRegistration(
      createProjectRequestDto,
    );
  }
}
