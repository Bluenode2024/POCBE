import {
  IsUUID,
  IsOptional,
  IsString,
  IsDate,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * ✅ 프로젝트 생성 DTO
 * leader_id는 request.user.userId에서 가져옴
 */
export class CreateProjectDto {
  @ApiProperty({
    description: '프로젝트 이름',
    example: '기여도 측정 및 보상 분배 프로젝트',
  })
  @IsString()
  project_name: string;

  @ApiProperty({
    description: '프로젝트 설명',
    example: '학회원들의 공정한 기여도 측정 및 보상 분배를 위한 Dapp ',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: '프로젝트 시작 날짜', example: '2025-02-23' })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  start_date: Date;

  @ApiProperty({ description: '프로젝트 종료 날짜', example: '2025-05-23' })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  end_date: Date;

  @ApiProperty({
    description: '프로젝트 멤버',
    example: [
      { member_id: '정원필', role: 'developer' },
      { member_id: '김승원', role: 'designer' },
    ],
    isArray: true,
  })
  @IsArray()
  members: { member_id: string; role: string }[];

  @ApiProperty({
    description: '프로젝트 레포지토리 링크',
    example: ['https://github.com/example1', 'https://github.com/example2'],
  })
  @IsArray()
  @IsString({ each: true }) // 여러 개의 링크를 배열로 받음
  repo_link: string[];
}

/**
 * ✅ 프로젝트 승인/거절 DTO
 */
export class ApproveProjectDto {
  @ApiProperty({
    description: '프로젝트 ID',
    example: 'b4f0e1e9-4c7b-4f5c-9c9b-9c9b9c9b9c9b',
  })
  @IsUUID()
  project_id: string;

  @ApiProperty({ description: '승인 상태', example: true })
  @IsBoolean()
  approve_status: boolean;

  @ApiProperty({
    description: '관리자 코멘트',
    example: '프로젝트 승인을 축하합니다!',
    required: false,
  })
  @IsOptional()
  @IsString()
  admin_comment?: string;
}

/**
 * ✅ 레포지토리 추가 DTO
 */
export class UpdateRepositoryDto {
  @ApiProperty({
    description: '프로젝트 ID',
    example: 'b4f0e1e9-4c7b-4f5c-9c9b-9c9b9c9b9c9b',
  })
  @IsUUID()
  project_id: string;

  @ApiProperty({
    description: '레포지토리 링크',
    example: 'https://github.com/example',
  })
  @IsString()
  repo_link: string;
}
