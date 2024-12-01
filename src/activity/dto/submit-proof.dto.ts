import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEthereumAddress, IsObject } from 'class-validator';

export class SubmitProofDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: '활동 유형 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  activityTypeId: string;

  @ApiProperty({
    description: '증명 데이터',
    example: {
      type: 'session_attendance',
      date: '2024-03-15',
      details: '블록체인 세션 참석',
    },
  })
  @IsObject()
  proofData: any;

  @ApiProperty({
    description: '서명',
    example: '0x...',
  })
  @IsString()
  signature: string;

  @ApiProperty({
    description: '지갑 주소',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @IsEthereumAddress()
  walletAddress: string;
}
