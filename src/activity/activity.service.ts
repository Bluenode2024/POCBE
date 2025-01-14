import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { IPFSService } from '../ipfs/ipfs.service';
import { WalletService } from '../blockchain/blockchain.service';
import { CreatePocActivityDto } from './dto/create-poc-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
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
    // IPFS에 증거 업로드
    const ipfsHash = await this.ipfsService.uploadJson(proofData);

    // 서명 검증
    const isValid = await this.walletService.verifySignature(
      `Submit proof: ${ipfsHash}`,
      signature,
      walletAddress,
    );

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // 증명 제출
    return this.supabase.rpc('submit_activity_proof', {
      p_user_id: userId,
      p_activity_type_id: activityTypeId,
      p_ipfs_hash: ipfsHash,
      p_proof_message: proofData.message,
    });
  }

  async approveActivityProof(
    proofId: string,
    adminId: string,
    adminWalletAddress: string,
    adminSignature: string,
  ) {
    // 서명 검증
    const isValid = await this.walletService.verifySignature(
      `Approve proof: ${proofId}`,
      adminSignature,
      adminWalletAddress,
    );

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // 증명 승인
    return this.supabase.rpc('approve_activity_proof', {
      p_proof_id: proofId,
      p_admin_id: adminId,
    });
  }
  async pocActivityRegistration(createPocActivityDto: CreatePocActivityDto) {
    const { data, error } = await this.supabase
      .from('poc_activities')
      .insert([
        {
          epoch_id: createPocActivityDto.epochId,
          title: createPocActivityDto.title,
          activity_type: createPocActivityDto.activityType,
          max_count_per_epoch: createPocActivityDto.maxCountPerEpoch,
          required_proof_type: createPocActivityDto.requiredProofType,
          created_by: createPocActivityDto.createdBy,
          is_active: true,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    console.log(data);
    return data;
  }
}
