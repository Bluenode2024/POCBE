// src/epoch/epoch.service.ts
import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateEpochDto } from './dto/create-epoch.dto';
import { WalletService } from '../blockchain/blockchain.service';

@Injectable()
export class EpochService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private readonly walletService: WalletService,
  ) {}

  async createEpoch(createEpochDto: CreateEpochDto, userId: string) {
    console.log(userId);
    const { data: findAdmin, error: findAdminError } = await this.supabase
      .from('admin')
      .select()
      .eq('user_id', userId)
      .single();
    console.log(findAdmin);
    if (!findAdmin || findAdmin.permission != 'Initial') {
      throw new UnauthorizedException(`이니셜 어드민이 아닙니다.`);
    }
    const { data, error } = await this.supabase
      .from('epoch')
      .insert([
        {
          title: createEpochDto.title,
          start_date: createEpochDto.startDate,
          end_date: createEpochDto.endDate,
          reward_value: createEpochDto.rewardValue,
        },
      ])
      .select()
      .single();

    if (error || findAdminError) {
      throw new Error(`Supabase Error: ${error.message}`);
    }
    console.log(data);
    return data;
  }

  async approveEpoch(epochId: string, userId: string) {
    const { data: findAdmin, error: findAdminError } = await this.supabase
      .from('admin')
      .select()
      .eq('user_id', userId)
      .single();

    if (!findAdmin || findAdmin.permission != 'Initial') {
      throw new UnauthorizedException(`이니셜 어드민이 아닙니다.`);
    }

    if (findAdminError) {
      throw new Error(`어드민 탐색 에러 ${findAdminError.message}`);
    }

    const { data, error } = await this.supabase
      .from('epoch')
      .update([
        {
          status: 'active',
          approved_by: findAdmin.id,
        },
      ])
      .eq('id', epochId)
      .select()
      .single();

    if (error) throw new Error(`에포크 승인 에러 ${error.message}`);
    return data;
  }

  async getCurrentEpoch() {
    const { data, error } = await this.supabase
      .from('epochs')
      .select('*')
      .eq('status', 'active')
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('활성화된 에포크가 없습니다');

    return data;
  }

  async settleEpoch(epochId: string, adminId: string) {
    const { data, error } = await this.supabase.rpc('settle_epoch', {
      p_epoch_id: epochId,
      p_admin_id: adminId,
    });

    if (error) throw error;
    return data;
  }

  async getEpochRewards(epochId: string) {
    const { data, error } = await this.supabase
      .from('epoch_settlements')
      .select(
        `
        *,
        users (
          username,
          full_name,
          wallet_address
        )
      `,
      )
      .eq('epoch_id', epochId);

    if (error) throw error;
    return data;
  }

  async getEpochActivities(epochId: string, userId?: string) {
    let query = this.supabase
      .from('activity_proofs')
      .select(
        `
        *,
        users (
          username,
          full_name
        ),
        poc_activities (
          activity_type,
          points
        )
      `,
      )
      .eq('epoch_id', epochId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // 내부 헬퍼 메서드
  private async calculateTotalPoints(epochId: string) {
    const { data, error } = await this.supabase
      .from('activity_proofs')
      .select('points_earned')
      .eq('epoch_id', epochId)
      .eq('status', 'approved');

    if (error) throw error;
    return data.reduce((sum, item) => sum + item.points_earned, 0);
  }
}
