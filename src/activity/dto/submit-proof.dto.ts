import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEthereumAddress,
  IsObject,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Express } from 'express';

export class SubmitProofDto {
  @ApiProperty({
    description: '활동 유형 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  activityTypeId: string;

  @ApiProperty({
    description: '증명 데이터 (JSON 문자열 형태)',
    example:
      '{"type":"session_attendance","date":"2025-03-15","details":"블록체인 세션 참석"}',
    type: 'string',
  })
  @IsString()
  proofData: string; // 문자열로 받아서 JSON.parse()로 변환 예정

  @ApiProperty({
    description: '첨부 파일 (옵션)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  file?: Express.Multer.File;
}

/**
 * ✅ IPFS 해시를 기반으로 증명을 제출하기 위한 DTO (서명 포함)
 */
export class SubmitProofSignatureDto {
  @ApiProperty({
    description: '활동 유형 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  activityTypeId: string;

  @ApiProperty({
    description: 'IPFS에 업로드된 증명 데이터의 해시값',
    example: 'bafkreihdwdceuuh6tp3tgjqzayvqsvhtzvflpe5hpxz3rx5cgys2q2j3we',
  })
  @IsString()
  jsonIpfsHash: string;

  @ApiProperty({
    description: 'IPFS에 업로드된 첨부 파일의 해시값 (파일이 없으면 null)',
    example: 'QmVtYjDqJqtxpqUw1MbbWp1k4GkYX5PfUvP9ZcNNFMRfPg',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileIpfsHash?: string;

  @ApiProperty({
    description: '사용자가 서명한 값',
    example:
      '0x9f89201b2d41270a281cf08bce03dcec8c07e10fd6c232dcfd04db348ffa770d...',
  })
  @IsString()
  signature: string;

  @ApiProperty({
    description: '사용자가 서명한 지갑의 주소소',
    example: '0xc832e2C6cB5F6893134225B204Af8733edeC8e92',
  })
  @IsString()
  walletAddress: string;
}
