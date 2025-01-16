import { Inject, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

export class UserService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}
  async userStatusUpdate(memberId: string, userId: string) {
    const { data: findAdmin, error: findAdminError } = await this.supabase
      .from('admin')
      .select()
      .eq('user_id', userId)
      .single();
    console.log(findAdmin);
    if (!findAdmin) {
      throw new UnauthorizedException(`admin이 아닙니다.`);
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
}
