import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';
import {
  CreateProjectDto,
  ApproveProjectDto,
  UpdateRepositoryDto,
} from './dto/project.dto';
@Injectable()
export class ProjectService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * 프로젝트 생성 (리더가 신청)
   */
  async createProject(dto: CreateProjectDto, leaderId: string) {
    const supabase = this.supabaseService.getClient();

    // 2️⃣ 프로젝트 추가 (leader_id를 신청자의 ID로 설정)
    const { data: project, error: projectError } = await supabase
      .from('project')
      .insert([
        {
          project_name: dto.project_name,
          description: dto.description,
          leader_id: leaderId,
          start_date: dto.start_date,
          end_date: dto.end_date,
          approve_status: false,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (projectError) throw new Error(projectError.message);

    // 3️⃣ 리더를 project_member 테이블에 추가 (role: 'leader')
    await supabase.from('project_member').insert([
      {
        project_id: project.id,
        members_id: leaderId,
        role: 'leader',
      },
    ]);

    for (const member of dto.members) {
      const { data: user, error: memberError } = await supabase
        .from('user')
        .select('id')
        .eq('name', member.member_name) // ✅ 입력된 이름과 일치하는 user 찾기
        .single();

      if (memberError || !user) {
        console.warn(
          `Warning: Member ${member.member_name} not found, skipping.`,
        );
        continue; // 멤버가 없으면 해당 멤버 추가를 건너뜀
      }

      await supabase.from('project_member').insert([
        {
          project_id: project.id,
          members_id: user.id, // ✅ 조회한 ID를 저장
          role: member.role,
        },
      ]);
    }
    if (dto.repo_link && dto.repo_link.length > 0) {
      for (const repo of dto.repo_link) {
        await supabase.from('repository').insert([
          {
            project_id: project.id,
            repo_link: repo, // 여러 개의 레포지토리 링크 추가
          },
        ]);
      }
    }

    return project;
  }
  /**
   * 프로젝트 승인/거절
   */
  async approveProject(dto: ApproveProjectDto, req) {
    const supabase = this.supabaseService.getClient();
    const userId = req.user.userId;

    // 1️⃣ 어드민 권한 확인
    const { data: isAdmin, error: isAdminError } = await supabase
      .from('admin')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (isAdminError || !isAdmin) {
      throw new UnauthorizedException('관리자 권한이 없습니다.');
    }

    //  프로젝트 상태 업데이트
    const { data: project, error: projectError } = await supabase
      .from('project')
      .update({
        approve_status: dto.approve_status,
        approved_by: isAdmin.id,
        admin_comment: dto.admin_comment,
        approved_at: new Date(),
      })
      .eq('id', dto.project_id)
      .select()
      .single();

    if (projectError) throw new Error(projectError.message);

    console.log(project, 'project');

    // 3️⃣ 해당 프로젝트의 레포지토리 링크 가져오기
    const { data: repositories } = await supabase
      .from('repository')
      .select('repo_link')
      .eq('project_id', dto.project_id);

    console.log(repositories, 'repositories');

    if (repositories && repositories.length > 0) {
      const webhookUrl = 'http://localhost:10000/api/repository';

      for (const repo of repositories) {
        try {
          // GitHub URL에서 저장소 이름 추출 (특수문자 제거)
          const repoName = repo.repo_link
            .split('/')
            .pop()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ''); // 특수문자 완전 제거

          const webhookData = {
            [repoName]: {
              meta: {
                title: repoName,
              },
              git: [repo.repo_link.trim()],
            },
          };

          console.log(`📤 Processing repository: ${repo.repo_link}`);
          console.log(
            '⏳ Sending webhook request with data:',
            JSON.stringify(webhookData, null, 2),
          );

          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData),
          });

          const responseData = await response.json();

          if (!response.ok) {
            console.error(
              `❌ Webhook failed for ${repo.repo_link}:`,
              responseData,
            );
          } else {
            console.log(
              `✅ Webhook successful for ${repo.repo_link}:`,
              responseData,
            );
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Error processing ${repo.repo_link}:`, error);
        }
      }
    }

    return project;
  }
  async getTasksByProjectId(projectId: string) {
    const supabase = this.supabaseService.getClient();
    const { data: task, error: taskError } = await supabase
      .from('task')
      .select(
        `id,
      poc:poc (entity, category, score, description)`,
      )
      .eq('project_id', projectId);

    if (taskError) {
      throw new Error(taskError.message);
    }

    return task;
  }
  async getTaskById(taskId: string) {
    const supabase = this.supabaseService.getClient();
    const { data: Task, error: TaskError } = await supabase
      .from('task')
      .select(
        `id,
      poc:poc (entity, category, score, description, epoch_id, signature),
      project:project!inner (id, project_name, description, status)`,
      )
      .eq('id', taskId);

    if (TaskError) {
      throw new Error(TaskError.message);
    }
    console.log('task:', Task);
    return Task;
  }
  async getMyTask(userId: string) {
    const supabase = this.supabaseService.getClient();
    const { data: myTask, error: myTaskError } = await supabase
      .from('task')
      .select(
        `
      task: id,
      poc:poc (entity, category, score, description),
      project:project!inner (id, project_name, description, status)
    `,
      )
      .eq('user_id', userId);

    if (!myTask || myTask.length === 0) {
      console.log('할당된 테스크가 존재하지 않습니다.');
    } else if (myTaskError) {
      throw new Error(myTaskError.message);
    }
    console.log('task:', myTask);
    return myTask;
  }

  async getMyTaskProgress(userId: string) {
    const supabase = this.supabaseService.getClient();
    const {
      data: allTask,
      count: allTaskCount,
      error: allTaskError,
    } = await supabase
      .from('task')
      .select(`*, project:project!inner(*)`, { count: 'exact' })
      .eq('user_id', userId)
      .in('project.status', ['active', 'success', 'validating', 'reported']); // 이번 에포크에 승인된 프로젝트가 가질 수 있는 모든 상태
    console.log('allTask:', allTask);
    const {
      data: successTask,
      count: successCount,
      error: successTaskError,
    } = await supabase
      .from('task')
      .select(`*, project:project!inner(*)`, { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'success')
      .in('project.status', ['active', 'success', 'validating', 'reported']);

    console.log('success task:', successTask);

    return { allTaskCount, successCount };
  }

  async getProjectProgressById(projectId: string) {
    const supabase = await this.supabaseService.getClient();
    const {
      data: allProjectTask,
      count: allProjectTaskCount,
      error: allProjectTaskError,
    } = await supabase
      .from('task')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId);

    console.log('allProjecetTask:', allProjectTask);

    const {
      data: doneTask,
      count: countDoneTask,
      error: doneTaskError,
    } = await supabase
      .from('task')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .eq('status', 'success');

    console.log('doneTask:', doneTask);

    return { allProjectTaskCount, countDoneTask };
  }

  /**
   * 승인된 프로젝트에 GitHub 링크 추가
   */
  async insertRepository(dto: UpdateRepositoryDto) {
    const supabase = this.supabaseService.getClient();

    // 1️⃣ 프로젝트 존재 여부 확인
    const { data: project, error: projectError } = await supabase
      .from('project')
      .select('approve_status')
      .eq('id', dto.project_id)
      .single();

    if (projectError || !project) throw new Error('Project not found');
    if (!project.approve_status) throw new Error('Project is not approved');

    // 2️⃣ 중복된 레포지토리 링크 여부 확인
    const { data: existingRepo } = await supabase
      .from('repository')
      .select('repo_link')
      .eq('project_id', dto.project_id)
      .eq('repo_link', dto.repo_link)
      .single();

    if (existingRepo) {
      throw new Error('Repository link already exists for this project');
    }

    // 3️⃣ 새로운 레포지토리 링크 추가
    const { error: insertError } = await supabase.from('repository').insert([
      {
        project_id: dto.project_id,
        repo_link: dto.repo_link,
      },
    ]);

    if (insertError) throw new Error(insertError.message);

    return { message: 'Repository link added successfully' };
  }
  /**
   * 특정 상태의 프로젝트 조회
   */
  async getProjectsByStatus(status: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('project')
      .select('*')
      .eq('status', status);

    if (error) throw new Error(error.message);

    return data;
  }

  /**
   * 사용자가 참여중/참여했던 모든 프로젝트 조회
   */
  async getMyProjects(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('project_member')
      .select(
        `
      project!inner(*)
    `,
      )
      .eq('members_id', userId)
      .in('project.status', ['active', 'validating']); // ✅ "active" 또는 "validating"인 프로젝트만 필터링

    if (error) throw new Error(error.message);

    return data;
  }
}
