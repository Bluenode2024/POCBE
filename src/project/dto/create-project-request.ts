import { IsArray, IsString } from 'class-validator';

// JSON 객체를 표현하는 클래스 정의
export class ProposedMemberDto {
  @IsString()
  userId: string;

  @IsString()
  role: string;
}

export class CreateProjectRequestDto {
  @IsString()
  epochId: string;
  @IsString()
  requestedBy: string;
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsArray()
  proposedMembers: ProposedMemberDto[];
}
