import { IsDateString, IsString } from 'class-validator';

export class CreateProjectTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  contribute_score: number;

  task_url: string;

  @IsDateString()
  deadline: string;
}
