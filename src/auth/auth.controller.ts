import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto, RegisterDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @ApiOperation({ summary: '지갑 서명을 통한 로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: { type: 'object' },
      },
    },
  })
  async signIn(@Body() signInDto: SignInDto) {
    console.log('SignIn Request Body:', signInDto); // 요청 데이터 출력
    return this.authService.signIn(signInDto);
  }

  @Post('register')
  @ApiOperation({ summary: '새 사용자 등록' })
  @ApiResponse({
    status: 201,
    description: '사용자 등록 성공',
  })
  async register(@Body() registerDto: RegisterDto) {
    console.log('Register Request Body:', registerDto); // 요청 데이터 출력
    return this.authService.register(registerDto);
  }
}
