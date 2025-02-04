import { IsString, IsUUID } from 'class-validator';

// JSON 객체를 표현하는 클래스 정의
export class CreateValidationDto {
  @IsUUID()
  taskId: string;
}

export class CreateValidatorDto {
  @IsString()
  stakingContractAddress: string;
}
