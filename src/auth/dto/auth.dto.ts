import { IsString, IsEthereumAddress } from 'class-validator';

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
  name: string;

  @IsString()
  department: string;

  @IsString()
  studentNumber: bigint;

  @IsEthereumAddress()
  walletAddress: string;
}
