import { IsInt, IsString } from 'class-validator';

export class CreatePocActivityDto {
  @IsString()
  epochId: string;

  @IsString()
  title: string;

  @IsString()
  activityType: string;

  @IsInt()
  maxCountPerEpoch: number;

  @IsString()
  requiredProofType: string;

  @IsString()
  createdBy: string;
}
