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

  async moniterUserTasks() {
    const { data: users, error: userError } = await this.supabase
      .from('users')
      .select('*');
    const { data: projects, error: projectError } = await this.supabase
      .from('projects')
      .select('*');
    const { data: projectTasks, error: projectTaskError } = await this.supabase
      .from('project_tasks')
      .select('*');
    const { data: userProjectTasks, error: userProjectTaskError } =
      await this.supabase.from('user_project_tasks').select('*');
    if (userError || projectError || projectTaskError || userProjectTaskError) {
      throw new Error(
        'supabase에서 데이터를 가져오는 과정에서 에러가 발생하였습니다.',
      );
    }
    const result = users.flatMap((user) => {
      const userProjectTask = userProjectTasks.filter(
        // [ task 1, task 2, ... ]
        (task) => task.user_id === user.id,
      );
      const setProjectTask = userProjectTask.reduce((acc, task) => {
        // task
        const projectTask = projectTasks.find(
          (pt) => pt.id === task.project_task_id,
        );
        if (!projectTask) return acc;
        const project = projects.find((p) => p.id === projectTask.project_id); // project ID
        if (!project) return acc;
        const projectId = project.id; // project ID
        const userId = user.id; // user ID
        const userProjectKey = `${projectId}-${userId}`; // key: "<project ID>-<user ID>"
        if (!acc[userProjectKey]) {
          acc[userProjectKey] = {
            userId: user.id,
            username: user.username,
            projectId: projectId,
            taskId: [],
            progress: { numerator: 0, denominator: 0 },
          };
        }
        acc[userProjectKey].taskId.push(projectTask.id);
        acc[userProjectKey].progress.denominator++;
        if (task.status === 'Completed') {
          acc[userProjectKey].progress.numerator++;
        }
        return acc;
      });
      return Object.values(setProjectTask).map((spt: any) => ({
        ...spt,
        progress: `${spt.progress.numerator}/${spt.progress.denominator}`,
      }));
    });
    return result;
  }

  async approveUserList() {
    const { data: users, error } = await this.supabase
      .from('users')
      .select('id, username, department, student_id, wallet_address')
      .is('approved_at', null);
    if (error) throw error;
    return users;
  }

  // async approveRevokeList() {
  //   const { data: users, error: userError } = await this.supabase
  //     .from('users')
  //     .select('*');
  //   const { data: adminRoles, error: adminRoleError } = await this.supabase
  //     .from('admin_roles')
  //     .select('*');
  //   const { data: projectMembers, error: projectError } = await this.supabase
  //     .from('project_members')
  //     .select('*');
  //   const result = adminRoles.flatMap((adminRole) => {});
  // }

  // async reportList() {
  //   const { data: }
  // }
}
