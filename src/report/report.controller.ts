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
import { CreateReportDto, UpdateReportDto } from './report.dto';

@Controller('report')
@UseGuards(AuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
  @Post()
  async CreateReport(@Body() createReportDto: CreateReportDto, @Request() req) {
    const userId = req.user.userId;
    return this.reportService.createReport(createReportDto, userId);
  }

  @Patch(':reportId')
  async updateReport(
    @Body() updateReportDto: UpdateReportDto,
    @Request() req,
    @Param('reportId') reportId,
  ) {
    const userId = req.user.userId;
    return this.reportService.updateReport(updateReportDto, userId, reportId);
  }
}
