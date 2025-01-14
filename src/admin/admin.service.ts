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

  async approveUserList() {
    const { data: users, error } = await this.supabase
      .from('users')
      .select('id, username, department, student_id, wallet_address')
      .is('approved_at', null);
    if (error) throw error;
    return users;
  }

  async closeProject(projectId: string, adminId: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .update({ status: 'Closed', closed_by: adminId, closed_at: new Date() })
      .eq('id', projectId);
    if (error) throw error;
    return data;
  }

  async approveRevokeList() {
    const { data: users, error: userError } = await this.supabase
      .from('users')
      .select('*');
    const { data: adminRoles, error: adminRoleError } = await this.supabase
      .from('admin_roles')
      .select('*');
    const { data: projectMembers, error: projectError } = await this.supabase
      .from('project_members')
      .select('*');

    if (userError || adminRoleError || projectError) {
      throw new Error('데이터를 가져오는 중 에러가 발생했습니다.');
    }

    const result = adminRoles.flatMap((adminRole) => {
      // 해당 adminRole에 연결된 사용자 필터링
      const adminUsers = users.filter((user) => user.role_id === adminRole.id);
      // 프로젝트 멤버와 교차 확인 (예: 특정 조건의 멤버만 반환)
      return adminUsers.filter((user) =>
        projectMembers.some((pm) => pm.user_id === user.id),
      );
    });

    return result;
  }
}
