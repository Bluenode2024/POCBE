import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AdminService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async grantAdminRole(
    granterId: string,
    newAdminId: string,
    walletAddress: string,
    isInitialAdmin: boolean = false,
  ) {
    const { data, error } = await this.supabase.rpc('admin_grant_role', {
      p_granter_id: granterId,
      p_new_admin_id: newAdminId,
      p_wallet_address: walletAddress,
      p_is_initial_admin: isInitialAdmin,
    });

    if (error) throw error;
    return data;
  }

  async approveUserRegistration(userId: string, adminId: string) {
    const { data, error } = await this.supabase.rpc(
      'approve_user_registration',
      {
        p_user_id: userId,
        p_admin_id: adminId,
      },
    );

    if (error) throw error;
    return data;
  }
}
