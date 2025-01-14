// src/auth/dto/auth.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsEthereumAddress } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: '이더리움 지갑 주소',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty({
    description: '서명할 메시지',
    example: 'Login to Academic Society at 2024-01-14 12:00:00',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: '메시지에 대한 전자 서명',
    example: '0x...',
  })
  @IsString()
  signature: string;
}

export class RegisterDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: '소속 학과',
    example: '컴퓨터공학과',
  })
  @IsString()
  department: string;

  @ApiProperty({
    description: '학번',
    example: 20201234,
  })
  @IsInt()
  studentId: number;

  @ApiProperty({
    description: '이더리움 지갑 주소',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @IsEthereumAddress()
  walletAddress: string;
}
