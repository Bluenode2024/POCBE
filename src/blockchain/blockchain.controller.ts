import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';
import { CreateTestSignatureDto } from './dto/create-test-signature.dto';
import { IPFSService } from '../ipfs/ipfs.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly ipfsService: IPFSService, // IPFSService 주입
  ) {}

  @Post('create-test-signature')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '테스트용 서명 생성' })
  @ApiResponse({
    status: 201,
    description: '테스트용 서명과 지갑 주소 생성 완료',
    schema: {
      example: {
        signature: '0x1234...5678',
        address: '0xabcd...efgh',
      },
    },
  })
  @ApiResponse({ status: 400, description: '유효하지 않은 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async createTestSignature(
    @Body() createTestProofDto: CreateTestSignatureDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // JSON 데이터 또는 파일 데이터를 IPFS에 업로드
    // proofData를 JSON 객체로 변환
    let proofData;
    try {
      proofData = JSON.parse(createTestProofDto.proofData);
    } catch (error) {
      throw new BadRequestException('Invalid proofData format. JSON expected.');
    }

    // IPFS에 JSON 데이터 업로드
    const jsonIpfsHash = await this.ipfsService.uploadJson(proofData);

    // IPFS에 첨부파일 업로드 (선택 사항)
    let fileIpfsHash = null;
    if (file) {
      fileIpfsHash = await this.ipfsService.uploadFile(
        file.buffer,
        file.originalname,
      );
    }
    const message = `${jsonIpfsHash} ${fileIpfsHash ?? ''}`;
    console.log('Message to sign:', message); // 디버깅용

    const signature = await this.blockchainService.createTestSignature(message);

    return {
      signature,
      address: signature.address,
      jsonIpfsHash,
      fileIpfsHash,
    };
  }
}
