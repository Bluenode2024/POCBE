import { IsString, IsEthereumAddress, IsOptional } from 'class-validator';

export class SignInDto {
  @IsEthereumAddress()
  walletAddress: string;

  @IsString()
  signature: string;

  @IsString()
  message: string;
}

export class RegisterDto {
  @IsString()
  username: string;

  @IsString()
  fullName: string;

  @IsString()
  department: string;

  @IsEthereumAddress()
  walletAddress: string;

  @IsString()
  studentId: string;
}
