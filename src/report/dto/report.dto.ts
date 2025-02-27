import { IsNotEmpty, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * ✅ Report 생성 DTO
 */
export class CreateReportDto {
  @ApiProperty({
    description: '검증 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  validation_id: string;

  @ApiProperty({
    description: '신고 코멘트',
    example: '이 검증은 오류가 있습니다.',
  })
  @IsString()
  @IsNotEmpty()
  reporter_comment: string;
}

export class CreateReportResponseDto {
  @ApiProperty({
    description: '리포트 아이디',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  report_id: string;

  @ApiProperty({
    description: '어드민 커맨트',
    example: '검토 후 승인되었습니다.',
  })
  @IsString()
  response_comment: string;

  @ApiProperty({
    description: '승인 여부',
    example: 'approve',
  })
  @IsString()
  status: string;
}

export class CreateReportResponse {
  @ApiProperty({
    description: '리포트 ID',
    example: 'db0a8b08-9cb8-41a8-8619-7a66...',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: '사용자 ID',
    example: 'faa59f94-be69-4328-a808-dadb...',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: '검증 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  validation_id: string;

  @ApiProperty({
    description: '예치 컨트랙트 주소',
    example: null,
  })
  @IsString()
  staking_contract_address: string;

  @ApiProperty({
    description: '리포트 상태',
    example: 'pending',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: '리포트 생성일',
    example: '2025-02-26T12:25:30.724+00:00',
  })
  @IsString()
  created_at: string;

  @ApiProperty({
    description: '신고 코멘트',
    example: '이 검증은 오류가 있습니다.',
  })
  @IsString()
  reporter_comment: string;
}
