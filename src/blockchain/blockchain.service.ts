import { Injectable, Inject } from '@nestjs/common';
import { ethers } from 'ethers';
import { CreateTestSignatureDto } from './dto/create-test-signature.dto';

@Injectable()
export class BlockchainService {
  constructor(
    @Inject('ETHEREUM_PROVIDER')
    private provider: ethers.Provider,
  ) {}

  // 테스트용 서명 생성 함수 추가
  async createTestSignature(message: string): Promise<{
    signature: string;
    address: string;
  }> {
    // 테스트용 지갑 생성 (실제 환경에서는 절대 사용하지 마세요!)
    const testWallet = ethers.Wallet.createRandom();
    const signature = await testWallet.signMessage(message);

    return {
      signature,
      address: await testWallet.getAddress(),
    };
  }

  async verifySignature(
    message: string,
    signature: string,
    address: string,
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('서명 검증 실패:', error);
      return false;
    }
  }

  async getTransactionReceipt(txHash: string) {
    return this.provider.getTransactionReceipt(txHash);
  }
}
