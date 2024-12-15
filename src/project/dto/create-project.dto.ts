import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProjectMemberDto {
  @ApiProperty({
    description: '멤버 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: '역할',
    example: 'developer',
  })
  @IsString()
  role: string;
}

export class CreateProjectDto {
  @ApiProperty({
    description: '프로젝트 제목',
    example: '블록체인 기반 기여도 측정 시스템',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '프로젝트 설명',
    example: '블록체인을 활용한 학회 기여도 측정 및 보상 시스템 개발',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: '프로젝트 리더 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  leaderId: string;

  @ApiProperty({
    description: '프로젝트 멤버 정보',
    type: [ProjectMemberDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectMemberDto)
  memberData: ProjectMemberDto[];
}

// export class RequestProjectDto {
//}
