import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, Min } from 'class-validator';
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
    description: '보상 금액',
    example: 1000000,
  })
  @IsNumber()
  @Min(0)
  rewardValue: number;
}
