import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreatePocActivityDto } from './dto/create-poc-activity.dto';
import { SubmitProofDto } from './dto/submit-proof.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post('submit-proof')
  async submitProof(@Body() submitProofDto: SubmitProofDto) {
    return this.activityService.submitActivityProof(
      submitProofDto.userId,
      submitProofDto.activityTypeId,
      submitProofDto.proofData,
      submitProofDto.signature,
      submitProofDto.walletAddress,
    );
  }

  @Post('approve-proof')
  async approveProof(
    @Body()
    data: {
      proofId: string;
      adminId: string;
      adminWalletAddress: string;
      adminSignature: string;
    },
  ) {
    return this.activityService.approveActivityProof(
      data.proofId,
      data.adminId,
      data.adminWalletAddress,
      data.adminSignature,
    );
  }

  @Post('create')
  async createPocActivity(@Body() createPocActivityDto: CreatePocActivityDto) {
    return this.activityService.pocActivityRegistration(createPocActivityDto);
  }
}
