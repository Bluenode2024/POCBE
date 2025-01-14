import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto, RegisterDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '새 사용자 등록',
    description: '새로운 학회원 가입 신청을 처리합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 신청 성공. 관리자 승인 대기 상태로 전환됩니다.',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Registration successful. Awaiting admin approval.',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            username: { type: 'string', example: '홍길동' },
            department: { type: 'string', example: '컴퓨터공학과' },
            student_id: { type: 'number', example: 20201234 },
            wallet_address: { type: 'string', example: '0x...' },
            status: { type: 'string', example: 'dormant' },
            request_status: { type: 'string', example: 'pending' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 등록된 지갑 주소 또는 학번',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Wallet address already registered',
        },
        error: { type: 'string', example: 'Conflict' },
        statusCode: { type: 'number', example: 409 },
      },
    },
  })
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    console.log('Register Request Body:', registerDto);
    return await this.authService.register(registerDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '지갑 서명을 통한 로그인',
    description: '메타마스크 등 Web3 지갑의 서명을 통해 로그인을 처리합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIs...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            department: { type: 'string' },
            student_id: { type: 'number' },
            wallet_address: { type: 'string' },
            status: { type: 'string' },
            isAdmin: { type: 'boolean' },
            roles: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Invalid signature',
        },
        error: {
          type: 'string',
          example: 'Unauthorized',
        },
        statusCode: {
          type: 'number',
          example: 401,
        },
      },
    },
  })
  async signIn(@Body(ValidationPipe) signInDto: SignInDto) {
    console.log('SignIn Request Body:', signInDto);
    return await this.authService.signIn(signInDto);
  }
}
