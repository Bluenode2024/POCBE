import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEpochDto {
  @ApiProperty({
    description: '에포크 제목',
    example: '2024년 1학기',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '시작일',
    example: '2024-03-01',
  })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: '종료일',
    example: '2024-06-30',
  })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({
    description: '전체 보상 풀',
    example: 1000000,
  })
  @IsNumber()
  @Min(0)
  totalRewardPool: number;

  @ApiProperty({
    description: '개인 활동 비율',
    example: 0.4,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  individualActivityRatio: number;

  @ApiProperty({
    description: '프로젝트 비율',
    example: 0.6,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  projectRatio: number;

  @ApiProperty({
    description: '최대 프로젝트 수',
    example: 5,
  })
  @IsNumber()
  @Min(1)
  maxProjects: number;
}
