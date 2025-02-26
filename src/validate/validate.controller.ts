import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ValidateService } from './validate.service';
import {
  CreateValidationDto,
  CreateValidatorDto,
  SuccessMessageResponse,
  UpdateValidationDto,
  UpdateValidationResponse,
} from './validate.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Validate')
@Controller('validate')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class ValidateController {
  constructor(private readonly validateService: ValidateService) {}
  @Post('validator')
  @ApiOperation({
    summary: '검증인 등록 API',
    description: '검증인을 등록하는 API입니다.',
  })
  @ApiBody({ type: CreateValidatorDto })
  @ApiResponse({
    status: 200,
    description: '검증인 등록 성공',
    content: {
      'application/json': {
        example: {
          id: '70e4fbf0-1687-4114-a918-f6...',
          user_id: '001a5f5f-2698-4c9b-8830-872...',
          staking_contract_address: '0xc832e2C6cB5F6893134225B204Af8733e...',
          created_at: '2025-02-26T08:02:26.336997+00:00',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 에러',
    content: {
      'application/json': {
        examples: {
          '검증인 조회 에러': {
            summary: '검증인 조회 에러',
            value: {
              message:
                '검증인 조회 중에 에러가 발생하였습니다: [Error Message]',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          '컨트랙트 주소 소유자 조회 에러': {
            summary: '컨트랙트 주소 소유자 조회 에러',
            value: {
              message:
                '컨트랙트 주소 소유자 조회 중에 에러가 발생하였습니다: [Error Message]',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
        },
      },
    },
  })
  async CreateValidator(@Body() createValidatorDto: CreateValidatorDto) {
    return this.validateService.createValidator(createValidatorDto);
  }

  @Post('validation')
  @ApiOperation({
    summary: '검증 생성 API',
    description: '검증을 생성하는 API입니다.',
  })
  @ApiBody({ type: CreateValidationDto })
  @ApiResponse({
    status: 200,
    description: '검증 생성 성공',
    content: {
      'application/json': {
        example: {
          id: '36eebe8a-49df-4c94-8c5d-ef...',
          vali_id: '367a5950-7fd2-42c5-b4b0-03f...',
          status: 'pending',
          comment: null,
          reward_contract_address: null,
          created_at: '2025-02-26T08:05:19.218001+00:00',
          task_id: '97f3c7d2-f305-4148-bbbd-4dc14...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 에러',
    content: {
      'application/json': {
        example: {
          message: '검증 생성 중에 에러가 발생하였습니다: [Error Message]',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    },
  })
  async CreateValidation(@Body() createValidationDto: CreateValidationDto) {
    return this.validateService.createValidation(createValidationDto);
  }

  @Patch('validation/:validationId')
  @ApiOperation({
    summary: '검증 상태를 validating으로 업데이트하는 API',
    description:
      '검증인이 테스크 완수를 인정하여 검증 상태를 validating으로 업데이트하는 API입니다.',
  })
  @ApiBody({ type: UpdateValidationDto })
  @ApiParam({
    name: 'validationId',
    required: true,
    description: '업데이트할 검증의 ID',
  })
  @ApiResponse({
    status: 200,
    description: '검증 상태 validating으로 업데이트 성공',
    type: UpdateValidationResponse,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 에러',
    content: {
      'application/json': {
        examples: {
          '검증 조회 에러': {
            summary: '검증 조회 에러',
            value: {
              message: '검증 조회 중에 에러가 발생하였습니다: [Error Message]',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          '검증인 확인 에러': {
            summary: '검증인 확인 에러',
            value: {
              message:
                '검증인 확인 중에 에러가 발생하였습니다: [Error Message]',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          '검증 완수 업데이트 에러': {
            summary: '검증 완수 업데이터 에러',
            value: {
              message:
                '검증 완수 업데이트 중에 에러가 발생하였습니다: [Error Message]',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청 에러',
    content: {
      'application/json': {
        example: {
          message: '검증인이 아닙니다.',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    },
  })
  async UpdateValidation(
    @Body() updateValidationDto: UpdateValidationDto,
    @Request() req,
    @Param('validationId') validationId,
  ) {
    const userId = req.user.userId;
    return this.validateService.updateValidation(
      updateValidationDto,
      userId,
      validationId,
    );
  }

  @Patch('reported/:validationId')
  @ApiOperation({
    summary: '검증 상태 reported로 업데이트하는 API',
    description:
      '검증에 대한 리포트가 승인되어 검증 상태를 reported으로 업데이트하는 API입니다.',
  })
  @ApiParam({
    name: 'validationId',
    required: true,
    description: '업데이트할 검증의 ID',
  })
  @ApiResponse({
    status: 200,
    description: '검증 상태를 reported로 업데이트 성공',
    type: SuccessMessageResponse,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 에러',
    content: {
      'application/json': {
        example: {
          message:
            '검증 완수 업데이트 중에 에러가 발생하였습니다: [Error Message]',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    },
  })
  async updateValidationToReported(
    @Param('validationId') validationId: string,
  ) {
    return this.validateService.updateValidationToReported(validationId);
  }

  /**
   * ✅ Reported 상태인 Validation 가져오기
   */
  @Get('reported')
  @ApiOperation({
    summary: '검증 상태가 reported인 검증을 조회하는 API',
    description: '검증 상태가 reported인 검증을 조회하는 API입니다.',
  })
  @ApiResponse({
    status: 200,
    description: '검증 상태가 reported인 검증 조회 성공',
    type: [UpdateValidationResponse],
  })
  async getReportedValidation() {
    return this.validateService.getReportedValidation();
  }
}
