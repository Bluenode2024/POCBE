import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEthereumAddress } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: '회원가입된 사용자의 지갑주소',
    example: '0xc832e2C6cB5F6893134225B204Af8733edeC8e92',
  })
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty({
    description: '메타마스크에서 사용자가 서명한 서명값',
    example: '개발자 모드에서는 아무 문자열이나 넣어도됨',
  })
  @IsString()
  signature: string;

  @ApiProperty({
    description: '사용자의 메세지',
    example: '테스트용 아무 메세지나 넣기 ',
  })
  @IsString()
  message: string;
}

export class RegisterDto {
  @ApiProperty({
    description: '사용자의 이름',
    example: '정원필',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description:
      '사용자의 학과(데이터 타입이 department type이라 아무 학과나 넣으면 에러남',
    example: 'computer_science',
  })
  @IsString()
  department: string;

  @ApiProperty({
    description: '사용자의 학번',
    example: '12250000',
  })
  @IsString()
  studentNumber: bigint;

  @ApiProperty({
    description: '사용자의 지갑주소',
    example: '0xc832e2C6cB5F6893134225B204Af8733edeC8e92',
  })
  @IsEthereumAddress()
  walletAddress: string;
}
