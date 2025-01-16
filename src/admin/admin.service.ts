import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AdminService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async grantAdminRole(userId: string, adminId: string) {
    console.log('userId', userId);
    console.log('adminId', adminId);
    const { data: findAdmin, error: findAdminError } = await this.supabase
      .from('admin')
      .select()
      .eq('user_id', adminId)
      .select()
      .single();
    if (!findAdmin) {
      throw new UnauthorizedException(`admin이 아닙니다.`);
    }
    const { data: checkAdmin, error: checkAdminError } = await this.supabase
      .from('admin')
      .select()
      .eq('user_id', userId)
      .single();
    if (checkAdmin) {
      throw new Error(`이미 admin입니다.`);
    }
    const { data, error } = await this.supabase
      .from('admin')
      .insert([
        {
          user_id: userId,
        },
      ])
      .select()
      .single();
    if (error || findAdminError || checkAdminError)
      throw new Error(`admin 역할 부여 에러 ${error.stack}`);
    return data;
  }

  // async grantAdminRole(
  //   granterId: string,
  //   newAdminId: string,
  //   walletAddress: string,
  //   isInitialAdmin: boolean = false,
  // ) {
  //   const { data, error } = await this.supabase.rpc('admin_grant_role', {
  //     p_granter_id: granterId,
  //     p_new_admin_id: newAdminId,
  //     p_wallet_address: walletAddress,
  //     p_is_initial_admin: isInitialAdmin,
  //   });

  //   if (error) throw error;
  //   return data;
  // }

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

  // async moniterUserTasks() {
  //   const { data: users, error: userError } = await this.supabase
  //     .from('users')
  //     .select('*');
  //   const { data: projects, error: projectError } = await this.supabase
  //     .from('projects')
  //     .select('*');
  //   const { data: projectTasks, error: projectTaskError } = await this.supabase
  //     .from('project_tasks')
  //     .select('*');
  //   const { data: userProjectTasks, error: userProjectTaskError } =
  //     await this.supabase.from('user_project_tasks').select('*');
  //   if (userError || projectError || projectTaskError || userProjectTaskError) {
  //     throw new Error(
  //       'supabase에서 데이터를 가져오는 과정에서 에러가 발생하였습니다.',
  //     );
  //   }
  //   const result = users.flatMap((user) => {
  //     const userProjectTask = userProjectTasks.filter(
  //       // [ task 1, task 2, ... ]
  //       (task) => task.user_id === user.id,
  //     );
  //     const setProjectTask = userProjectTask.reduce((acc, task) => {
  //       // task
  //       const projectTask = projectTasks.find(
  //         (pt) => pt.id === task.project_task_id,
  //       );
  //       if (!projectTask) return acc;
  //       const project = projects.find((p) => p.id === projectTask.project_id); // project ID
  //       if (!project) return acc;
  //       const projectId = project.id; // project ID
  //       const userId = user.id; // user ID
  //       const userProjectKey = `${projectId}-${userId}`; // key: "<project ID>-<user ID>"
  //       if (!acc[userProjectKey]) {
  //         acc[userProjectKey] = {
  //           userId: user.id,
  //           username: user.username,
  //           projectId: projectId,
  //           taskId: [],
  //           progress: { numerator: 0, denominator: 0 },
  //         };
  //       }
  //       acc[userProjectKey].taskId.push(projectTask.id);
  //       acc[userProjectKey].progress.denominator++;
  //       if (task.status === 'Completed') {
  //         acc[userProjectKey].progress.numerator++;
  //       }
  //       return acc;
  //     });
  //     return Object.values(setProjectTask).map((spt: any) => ({
  //       ...spt,
  //       progress: `${spt.progress.numerator}/${spt.progress.denominator}`,
  //     }));
  //   });
  //   return result;
  // }

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
