import { IsString, IsUUID } from 'class-validator';

export class CreateReportDto {
  @IsString()
  content: string;

  @IsUUID()
  validationId: string;

  @IsString()
  stakingContractAddress: string;

  @IsUUID()
  adminId: string;
}

export class UpdateReportDto {
  @IsString()
  responseComment: string;
}
