import { Injectable, Inject } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class WalletService {
  constructor(
    @Inject('ETHEREUM_PROVIDER')
    private provider: ethers.Provider,
  ) {}

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
