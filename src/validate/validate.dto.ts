import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

// JSON 객체를 표현하는 클래스 정의
export class CreateValidationDto {
  @IsUUID()
  @ApiProperty({
    description: '테스크 ID',
    example: '97f3c7d2-f305-4148-bbbd-4dc14...',
  })
  taskId: string;
}

export class CreateValidatorDto {
  @IsString()
  @ApiProperty({
    description: '돈을 예치한 지갑 주소',
    example: '0xc832e2C6cB5F6893134225B204Af8733e...',
  })
  walletAddress: string;
}

export class UpdateValidationDto {
  @IsString()
  @ApiProperty({
    description: '검증인의 코멘트',
    example: 'comment...',
  })
  comment: string;

  @IsString()
  @ApiProperty({
    description: '검증 보상 컨트랙트 주소',
    example: '0xc832e2C6cB5F6893134225B204Af8733e...',
  })
  rewardContractAddress: string;
}

export class UpdateValidationResponse {
  @IsUUID()
  @ApiProperty({
    description: '검증 ID',
    example: '27520da2-cf32-4a84-8022-723f...',
  })
  id: string;

  @IsUUID()
  @ApiProperty({
    description: '검증인 ID',
    example: 'f95adae0-f350-4438-89dc-f721...',
  })
  vali_id: string;

  @IsString()
  @ApiProperty({
    description: '검증 상태',
    example: 'validating',
  })
  status: string;

  @IsString()
  @ApiProperty({
    description: '검증인의 코멘트',
    example: 'comment...',
  })
  comment: string;

  @IsString()
  @ApiProperty({
    description: '검증 보상 컨트랙트 주소',
    example: '0xc832e2C6cB5F6893134225B204Af8733e...',
  })
  reward_contract_address: string;

  @IsString()
  @ApiProperty({
    description: '생성일',
    example: '2025-02-26T08:08:41.535+00:00',
  })
  created_at: string;

  @IsUUID()
  @ApiProperty({
    description: '테스크 ID',
    example: '97f3c7d2-f305-4148-bbbd-4dc14...',
  })
  task_id: string;
}

export class SuccessMessageResponse {
  @IsString()
  @ApiProperty({
    description: '성공 메시지',
    example: '검증 상태를 성공적으로 reported로 업데이트하였습니다.',
  })
  message: string;
}
