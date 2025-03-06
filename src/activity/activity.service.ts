import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { IPFSService } from '../ipfs/ipfs.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreatePocActivityDto } from './dto/create-poc-activity.dto';
import { Express } from 'express';

@Injectable()
export class ActivityService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private ipfsService: IPFSService,
    private blockchainService: BlockchainService,
  ) {}

  async generateProofHash(proofData: string, file?: Express.Multer.File) {
    // 1️⃣ proofData를 JSON으로 변환
    // JSON 파싱 예외 처리
    let parsedProofData;
    try {
      parsedProofData = JSON.parse(proofData);
    } catch (error) {
      throw new Error('Invalid JSON format for proofData.');
    }

    // 2️⃣ JSON 데이터를 IPFS에 업로드
    const jsonIpfsHash = await this.ipfsService.uploadJson(parsedProofData);

    // 3️⃣ 파일이 있다면 IPFS에 업로드
    let fileIpfsHash = null;
    if (file) {
      fileIpfsHash = await this.ipfsService.uploadFile(
        file.buffer,
        file.originalname,
      );
    }

    return {
      jsonIpfsHash,
      fileIpfsHash,
      message: `Submit proof: ${jsonIpfsHash} ${fileIpfsHash ?? ''}`,
    };
  }

  async submitActivityProof(
    taskId: string,
    userId: string,

    activityTypeId: string,
    jsonIpfsHash: string,
    fileIpfsHash: string | null,
    signature: string,
    walletAddress: string,
  ) {
    const jsonIpfsUrl = `https://gateway.pinata.cloud/ipfs/${jsonIpfsHash}`;
    const fileIpfsUrl = fileIpfsHash
      ? `https://gateway.pinata.cloud/ipfs/${fileIpfsHash}`
      : null;
    const message = `${jsonIpfsHash} ${fileIpfsHash ?? ''}`;

    console.log('message:', message);

    // 2️⃣ 서명 검증
    const isValid = await this.blockchainService.verifySignature(
      message,
      signature,
      walletAddress,
    );

    if (!isValid) {
      throw new Error('Invalid signature'); // ❌ 서명이 올바르지 않다면 에러 반환
    }

    // 3️⃣ 증명 제출
    return this.supabase.rpc('submit_activity_proof', {
      p_task_id: taskId,
      p_user_id: userId,
      p_activity_type_id: activityTypeId,
      p_ipfs_hash: jsonIpfsUrl,
      p_file_ipfs_hash: fileIpfsUrl,
      p_proof_message: message,
      p_signature: signature,
      p_wallet_address: walletAddress,
    });
  }

  async approveActivityProof(
    proofId: string,
    adminId: string,
    adminWalletAddress: string,
    adminSignature: string,
  ) {
    // 서명 검증
    const isValid = await this.blockchainService.verifySignature(
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
