import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  IPFSUrl: string;

  @ApiProperty({
    description: '점수',
    example: 10,
  })
  @IsNumber()
  score: number;

  @IsUUID()
  projectId: string;
}
