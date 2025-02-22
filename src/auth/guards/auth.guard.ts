import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      console.error('❌ 인증 토큰이 요청에 포함되지 않았습니다.');
      throw new UnauthorizedException('인증 토큰이 필요합니다.');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      }); // 자꾸 시크릿키 or 공개키가 없다고 해서 명시적으로 전달해줌
      console.log('✅ 인증 성공, payload: ', payload);
      request['user'] = payload;
      return true;
    } catch (error) {
      // ✅ 예외 처리 세분화
      console.error('❌ JWT 검증 실패:', error.message);

      if (error.name === 'TokenExpiredError') {
        console.error('❌ 토큰이 만료되었습니다.');
        throw new UnauthorizedException('토큰이 만료되었습니다.');
      }
      if (error.name === 'JsonWebTokenError') {
        console.error('❌ 유효하지 않은 토큰입니다.');
        throw new ForbiddenException('유효하지 않은 토큰입니다.');
      }

      throw new UnauthorizedException('인증 실패');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // ✅ Bearer Token 추출
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');

    // ✅ Bearer 타입만 허용
    return type === 'Bearer' ? token : undefined;
  }
}
