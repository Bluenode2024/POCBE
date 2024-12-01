import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../config/supabase.config';
import { IPFSService } from '../ipfs/ipfs.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class ActivityService {
  constructor(
    private supabaseService: SupabaseService,
    private ipfsService: IPFSService,
    private walletService: WalletService,
  ) {}

  async submitActivityProof(
    userId: string,
    activityTypeId: string,
    proofData: any,
    signature: string,
    walletAddress: string,
  ) {
    // IPFS에 증명 데이터 업로드
    const ipfsHash = await this.ipfsService.uploadJSON(proofData);

    // 서명 검증
    const message = `Submitting activity proof: ${ipfsHash}`;
    const isValidSignature = await this.walletService.verifySignature(
      message,
      signature,
      walletAddress,
    );

    if (!isValidSignature) {
      throw new Error('Invalid signature');
    }

    // Supabase에 증명 제출
    const { data, error } = await this.supabaseService.client.rpc(
      'submit_activity_proof',
      {
        p_user_id: userId,
        p_activity_type_id: activityTypeId,
        p_ipfs_hash: ipfsHash,
        p_proof_message: message,
      },
    );

    if (error) throw error;
    return data;
  }
}
