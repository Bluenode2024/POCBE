import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  validation_id: string;

  @IsNotEmpty()
  @IsString()
  reporter_comment: string;
}
