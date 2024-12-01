import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';
import { SupabaseClient } from '@supabase/supabase-js';
//import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 핸들러에 설정된 필요한 역할들을 가져옵니다
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 역할이 지정되지 않았다면 접근을 허용합니다
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id; // JWT로부터 추출된 사용자 ID

    if (!userId) {
      return false;
    }

    // 사용자의 역할들을 확인합니다
    const userRoles = await this.getUserRoles(userId);

    // 프로젝트 리더 권한 체크를 위한 특별 처리
    if (requiredRoles.includes('project_leader')) {
      const projectId = request.params.projectId;
      if (projectId) {
        const isProjectLeader = await this.isUserProjectLeader(
          userId,
          projectId,
        );
        if (isProjectLeader) {
          return true;
        }
      }
    }

    // admin 권한 체크
    if (requiredRoles.includes('admin')) {
      const { data: adminRole } = await this.supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (adminRole) {
        return true;
      }
    }

    // 일반 사용자 권한 체크
    return requiredRoles.some((role) => userRoles.includes(role));
  }

  private async getUserRoles(userId: string): Promise<UserRole[]> {
    const roles: UserRole[] = ['user']; // 기본적으로 모든 인증된 사용자는 'user' 역할을 가집니다

    // admin_roles 테이블에서 관리자 권한 확인
    const { data: adminRole } = await this.supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (adminRole) {
      roles.push('admin');
    }

    // project_members 테이블에서 프로젝트 리더 권한 확인
    const { data: projectLeaderRoles } = await this.supabase
      .from('project_members')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'leader')
      .eq('is_active', true);

    if (projectLeaderRoles && projectLeaderRoles.length > 0) {
      roles.push('project_leader');
    }

    return roles;
  }

  private async isUserProjectLeader(
    userId: string,
    projectId: string,
  ): Promise<boolean> {
    const { data } = await this.supabase
      .from('project_members')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .eq('role', 'leader')
      .eq('is_active', true)
      .single();

    return !!data;
  }
}
