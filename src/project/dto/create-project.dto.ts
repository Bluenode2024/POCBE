import { IsString, IsDate, IsArray, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  project_name: string;

  @IsString()
  description: string;

  @IsUUID()
  leader_id: string;

  @IsDate()
  start_date: Date;

  @IsDate()
  end_date: Date;

  @IsArray()
  members: { member_name: string; role: string }[];

  @IsString()
  repo_link: string[];
}
