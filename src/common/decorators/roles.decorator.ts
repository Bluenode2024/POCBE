import { SetMetadata } from '@nestjs/common';

// Role 타입 정의 - 프로젝트의 역할들
export type UserRole = 'admin' | 'user' | 'project_leader';

// roles 키로 메타데이터를 설정하는 데코레이터
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
