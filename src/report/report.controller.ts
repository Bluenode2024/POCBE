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
import { CreateReportDto, CreateReportResponse } from './dto/report.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Report')
@Controller('report')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({
    summary: '리포트 생성 API',
    description: '검증에 대한 리포트를 생성하는 API입니다.',
  })
  @ApiResponse({
    status: 201,
    description: '리포트 생성 성공',
    type: CreateReportResponse,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 에러',
    content: {
      'application/json': {
        examples: {
          '리포트 생성 에러': {
            summary: '리포트 생성 에러',
            value: {
              message:
                '리포트 생성 중에 에러가 발생하였습니다: [Error Message]',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          '검증 업데이트 에러': {
            summary: '검증 업데이트 에러',
            value: {
              message:
                '검증 업데이트 중에 에러가 발생하였습니다: [Error Message]',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
        },
      },
    },
  })
  @ApiBody({ type: CreateReportDto })
  async createReport(@Body() createReportDto: CreateReportDto, @Request() req) {
    const userId = req.user.userId;
    return this.reportService.createReport(createReportDto, userId);
  }

  // /**
  //  * ✅ Report 응답 생성
  //  */
  // @Post('response')
  // @ApiOperation({ summary: 'Report 응답 생성' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Report 응답이 성공적으로 생성되었습니다.',
  // })
  // async createReportResponse(
  //   @Body() createReportResponseDto: CreateReportResponseDto,
  //   @Request() req,
  // ) {
  //   // ✅ isAdmin()과 GetUserId() 제거 -> req.user.userId 사용
  //   const userId = req.user.userId;

  //   return this.reportService.createReportResponse(
  //     userId,
  //     createReportResponseDto,
  //   );
  // }

  @Patch('success/:reportId')
  @ApiOperation({
    summary: '리포트 승인 API',
    description: '검증에 대한 리포트를 승인하는 API입니다.',
  })
  @ApiResponse({
    status: 200,
    description: '리포트 승인 성공',
    content: {
      'application/json': {
        example: {
          message: '리포트를 성공적으로 승인하였습니다.',
        },
      },
    },
  })
  @ApiParam({
    name: 'reportId',
    required: true,
    description: '승인할 리포트 ID',
  })
  @ApiResponse({
    status: 400,
    description: '리포트 승인 실패',
    content: {
      'application/json': {
        example: {
          message: '리포트 승인 중에 에러가 발생하였습니다: [Error Message]',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    },
  })
  async updateReportToAccept(@Param('reportId') reportId: string) {
    return this.reportService.updateReportToAccept(reportId);
  }

  @ApiOperation({
    summary: '리포트 반려 API',
    description: '검증에 대한 리포트를 반려하는 API입니다.',
  })
  @ApiResponse({
    status: 200,
    description: '리포트 반려 성공',
    content: {
      'application/json': {
        example: {
          message: '리포트를 성공적으로 반려하였습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '리포트 반려 실패',
    content: {
      'application/json': {
        example: {
          message: '리포트 반려 중에 에러가 발생하였습니다: [Error Message]',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    },
  })
  @ApiParam({
    name: 'reportId',
    required: true,
    description: '반려할 리포트 ID',
  })
  @Patch('reject/:reportId')
  async updateReportToReject(@Param('reportId') reportId: string) {
    return this.reportService.updateReportToReject(reportId);
  }
}
