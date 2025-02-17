import { IsUUID, IsOptional, IsString } from 'class-validator';

export class ApproveProjectDto {
  @IsUUID()
  project_id: string;

  @IsString()
  approve_status: 'false' | 'true';

  @IsUUID()
  approved_by: string;

  @IsOptional()
  @IsString()
  admin_comment?: string;
}
