import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ReportService } from './report.service';
import { CreateReportDto, CreateReportResponseDto } from './dto/report.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Report')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Report 생성' })
  @ApiResponse({
    status: 201,
    description: 'Report가 성공적으로 생성되었습니다.',
  })
  async createReport(@Body() createReportDto: CreateReportDto, @Request() req) {
    const userId = req.user.userId;
    return this.reportService.createReport(createReportDto, userId);
  }

  /**
   * ✅ Report 응답 생성
   */
  @Post('response')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Report 응답 생성' })
  @ApiResponse({
    status: 201,
    description: 'Report 응답이 성공적으로 생성되었습니다.',
  })
  async createReportResponse(
    @Body() createReportResponseDto: CreateReportResponseDto,
    @Request() req,
  ) {
    // ✅ isAdmin()과 GetUserId() 제거 -> req.user.userId 사용
    const userId = req.user.userId;

    return this.reportService.createReportResponse(
      userId,
      createReportResponseDto,
    );
  }

  @Patch('success/:reportId')
  async updateReportToAccept(@Param('reportId') reportId: string) {
    return this.reportService.updateReportToAccept(reportId);
  }

  @Patch('reject/:reportId')
  async updateReportToReject(@Param('reportId') reportId: string) {
    return this.reportService.updateReportToReject(reportId);
  }
}
