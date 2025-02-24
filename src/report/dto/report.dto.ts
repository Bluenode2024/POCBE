import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';
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
