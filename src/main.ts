import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  ValidationPipe,
  ValidationError,
  BadRequestException,
} from '@nestjs/common';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('PoC System API')
    .setDescription('Proof of Contribution 시스템 API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // CORS 설정
  app.enableCors({
    origin: 'http://localhost:3000', // 허용할 클라이언트 도메인
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 허용할 메서드
    allowedHeaders: ['Content-Type', 'Authorization'], // 허용할 헤더
    credentials: true, // 쿠키 허용 여부
  });

  // x-www-form-urlencoded 데이터 처리
  app.use(bodyParser.urlencoded({ extended: true }));

  // 전역 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 요청 데이터를 DTO로 변환
      whitelist: true, // DTO에 정의된 필드만 허용
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 필드는 에러 반환
      exceptionFactory: (errors: ValidationError[]) => {
        // 유효성 검사 실패 시 에러 로그 출력
        console.error('Validation Failed:', JSON.stringify(errors, null, 2));

        // 에러 메시지 사용자 정의
        const errorMessages = errors.map((error) => ({
          field: error.property,
          issues: Object.values(error.constraints || {}),
        }));

        return new BadRequestException({
          message: 'Validation failed',
          errors: errorMessages,
        });
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
