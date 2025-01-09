import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateProjectRequestDto } from './dto/create-project-request';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('project')
@UseGuards(AuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post(':epochId')
  async createProject(
    @Param('epochId') epochId: string,
    @Body() newProject: CreateProjectDto,
    @Request() req,
  ) {
    const leaderId = req.user.userId;
    console.log('req.user', req.user);
    return this.projectService.createProject(
      epochId,
      newProject.title,
      newProject.description,
      newProject.memberData,
      newProject.startDate,
      newProject.endDate,
      leaderId,
    );
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

  @Post('freerider-vote')
  async submitFreeriderVote(
    @Body()
    data: {
      projectId: string;
      voterId: string;
      targetUserId: string;
      voteTxHash: string;
    },
  ) {
    return this.projectService.submitFreeriderVote(
      data.projectId,
      data.voterId,
      data.targetUserId,
      data.voteTxHash,
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
