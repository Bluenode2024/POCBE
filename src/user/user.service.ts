import { Inject, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

export class UserService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async getAllUsers() {
    const { data: allUser, error: allUserError } = await this.supabase
      .from('user')
      .select('*');

    console.log(allUser);
    if (!allUser) throw new UnauthorizedException(`유저가 존재하지 않습니다.`);
    else if (allUserError)
      throw new UnauthorizedException(`유저를 찾는데 실패하였습니다.`);

    return allUser;
  }

  async userStatusUpdate(memberId: string, userId: string) {
    const { data: findAdmin, error: findAdminError } = await this.supabase
      .from('admin')
      .select()
      .eq('user_id', userId)
      .single();
    console.log(findAdmin);
    if (!findAdmin || findAdmin.permission != 'Initial') {
      throw new UnauthorizedException(`이니셜 어드민이 아닙니다.`);
    }

    const currentDateTime = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('user')
      .update({
        status: 'active',
        approved_at: currentDateTime,
        admin_id: findAdmin.id,
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error || findAdminError) {
      throw new Error(`${error.message}`);
    }
    return data;
  }

  // 입력받은 wallet_address에 매핑된 user_id를 가져옴
  async getUserId(walletAddress: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('user')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (error || !data) throw new Error('User not found');

    return data.id;
  }

  async getMyInfo(userId: string) {
    const { data: Mydata, error: MydataError } = await this.supabase
      .from('user')
      .select('*')
      .eq('id', userId)
      .single();

    if (MydataError || !Mydata) throw new Error('User not found');

    return Mydata;
  }
}
