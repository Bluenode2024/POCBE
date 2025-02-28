import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// 내부 ProofData 타입을 위한 DTO
export class ProofDataDto {
  @ApiProperty({
    description: '증명 타입',
    example: 'session_attendance'
  })
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: '날짜',
    example: '2024-03-15'
  })
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: '상세 내용',
    example: '블록체인 세션 참석'
  })
  @IsNotEmpty()
  details: string;
}

export class CreateTestSignatureDto {
  @ApiProperty({
    description: '증명 데이터',
    type: ProofDataDto
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ProofDataDto)
  proofData: ProofDataDto;
}