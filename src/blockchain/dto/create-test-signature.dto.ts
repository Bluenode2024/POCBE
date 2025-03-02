import { ApiProperty } from '@nestjs/swagger';
import {
  IsObject,
  IsNotEmpty,
  ValidateNested,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Express } from 'express';

export class CreateTestSignatureDto {
  @ApiProperty({
    description: '증명 데이터 (JSON 문자열 형태)',
    example:
      '{"type":"session_attendance","date":"2025-03-15","details":"블록체인 세션 참석"}',
    type: 'string',
  })
  @IsString()
  proofData: string; // 문자열로 받아서 JSON.parse()로 변환 예정

  @ApiProperty({
    description: '첨부 파일(이미지, pdf, word, txt 등)',
    type: 'string',
    format: 'binary', // Swagger에서 파일 업로드 가능하게 설정
    required: false,
  })
  @IsOptional()
  file?: Express.Multer.File;
}
