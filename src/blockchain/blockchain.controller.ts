import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';
import { CreateTestSignatureDto } from './dto/create-test-signature.dto';
import { IPFSService } from '../ipfs/ipfs.service';

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly ipfsService: IPFSService  // IPFSService 주입
  ) {}

  @Post('create-test-signature')
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
  async createTestSignature(@Body() createTestSignatureDto: CreateTestSignatureDto) {
    // proofData를 DTO에서 받아옴
    const ipfsHash = await this.ipfsService.uploadJson(createTestSignatureDto.proofData);
    
    // IPFS 해시를 포함한 메시지로 서명 생성
    const message = `Submit proof: ${ipfsHash}`;
    console.log('Message to sign:', message); // 디버깅용
    
    return this.blockchainService.createTestSignature(message);
  }
}