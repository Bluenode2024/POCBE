import { IsUUID, IsString } from 'class-validator';

export class UpdateRepositoryDto {
  @IsUUID()
  project_id: string;

  @IsString()
  repo_link: string;
}
