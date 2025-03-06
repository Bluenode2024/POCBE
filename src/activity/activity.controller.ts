import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  Request,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreatePocActivityDto } from './dto/create-poc-activity.dto';
import {
  SubmitProofDto,
  SubmitProofSignatureDto,
} from './dto/submit-proof.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post('generate-proof-hash')
  @UseInterceptors(FileInterceptor('file')) // 파일 업로드 허용
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '사용자의 활동 증명을 IPFS에 업로드하고 해시 생성' })
  @ApiResponse({ status: 201, description: 'IPFS 해시 생성 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async generateProofHash(
    @Body() submitProofDto: SubmitProofDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const { jsonIpfsHash, fileIpfsHash, message } =
      await this.activityService.generateProofHash(
        submitProofDto.proofData,
        file,
      );

    return {
      jsonIpfsHash,
      fileIpfsHash,
      message,
    };
  }

  @Post(':id/submit-proof')
  @ApiOperation({ summary: 'IPFS 해시를 기반으로 활동 증명 제출' })
  @ApiResponse({ status: 201, description: '활동 증명 제출 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async submitProof(
    @Param('id') taskId,
    @Body() submitProofSignatureDto: SubmitProofSignatureDto,
    @Request() req,
  ) {
    const userId = req.user.userId;

    return this.activityService.submitActivityProof(
      taskId,
      userId,

      submitProofSignatureDto.activityTypeId,
      submitProofSignatureDto.jsonIpfsHash,
      submitProofSignatureDto.fileIpfsHash,
      submitProofSignatureDto.signature,
      submitProofSignatureDto.walletAddress,
    );
  }

  @Post('approve-proof')
  @ApiOperation({ summary: '관리자가 활동 증명을 승인' })
  @ApiResponse({ status: 200, description: '활동 증명 승인 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
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
  @ApiOperation({ summary: 'PoC 활동 생성' })
  @ApiResponse({ status: 201, description: 'PoC 활동 생성 성공' })
  async createPocActivity(@Body() createPocActivityDto: CreatePocActivityDto) {
    return this.activityService.pocActivityRegistration(createPocActivityDto);
  }
}
