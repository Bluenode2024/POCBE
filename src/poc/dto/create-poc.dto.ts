import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class CreatePocDto {
  @ApiProperty({
    description: 'POC 항목',
    example: 'UI 디자인',
  })
  @IsString()
  entity: string;

  @ApiProperty({
    description: '서명',
    example: '서명',
  })
  @IsString()
  signature: string;

  @ApiProperty({
    description: 'POC 종류',
    example: '디자인',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: '기여 점수',
    example: 10,
  })
  @IsNumber()
  score: number;

  @ApiProperty({
    description: '설명',
    example: 'UI/UX 개선을 우한 디자인 제안',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: '에포크 ID',
    example: 'f9890740-eefc-467a-8c1a-1a0215a7da59',
  })
  @IsUUID()
  epoch_id: UUID;
}
