import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ApproveProjectDto } from './dto/approve-project.dto';
import { UpdateRepositoryDto } from './dto/update-repository.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * 프로젝트 생성 (리더가 신청)
   */
  async createProject(dto: CreateProjectDto, walletAddress: string) {
    const supabase = this.supabaseService.getClient();

    // 1️⃣ 신청자의 ID 가져오기 (wallet_address 기준 검색)
    const { data: applicant, error: userError } = await supabase
      .from('user')
      .select('id')
      .eq('wallet_address', walletAddress) // 이메일 대신 wallet_address 사용
      .single();

    if (userError || !applicant) throw new Error('Applicant not found');

    // 2️⃣ 프로젝트 추가 (leader_id를 신청자의 ID로 설정)
    const { data: project, error: projectError } = await supabase
      .from('project')
      .insert([
        {
          project_name: dto.project_name,
          description: dto.description,
          leader_id: applicant.id,
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
        members_id: applicant.id,
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
          role: 'member',
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
  async approveProject(dto: ApproveProjectDto, walletAddress: string) {
    const supabase = this.supabaseService.getClient();
    // 승인자의 ID 가져오기 (wallet_address 기준 검색)
    const { data: applicant, error: userError } = await supabase
      .from('user')
      .select('id')
      .eq('wallet_address', walletAddress) // 이메일 대신 wallet_address 사용
      .single();

    if (userError || !applicant) throw new Error('Applicant not found');

    // 1️⃣ 프로젝트 상태 업데이트
    const { data: project, error: projectError } = await supabase
      .from('project')
      .update({
        status: dto.approve_status,
        approved_by: applicant.id,
        admin_comment: dto.admin_comment,
        approved_at: new Date(),
      })
      .eq('id', dto.project_id)
      .select()
      .single();

    if (projectError) throw new Error(projectError.message);

    // 3️⃣ 해당 프로젝트의 레포지토리 링크 가져오기
    const { data: repositories } = await supabase
      .from('repository')
      .select('repo_link')
      .eq('project_id', dto.project_id);

    if (repositories.length > 0) {
      // ✅ 4️⃣ 레포지토리가 존재하면 웹훅 호출
      const webhookUrl = 'http://localhost:4000/webhook'; // 기여도 평가 프로그램의 웹훅 URL

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer TEST_SECRET_KEY`, // 보안 강화를 위한 API Key
        },
        body: JSON.stringify({
          project_name: project.project_name,
          repositories: repositories.map((repo) => repo.repo_link),
        }),
      });

      if (!response.ok) {
        console.error('❌ Webhook failed:', await response.text());
      } else {
        console.log('✅ Webhook sent successfully!');
      }
    }

    return project;
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
    const { data: existingRepo, error: repoError } = await supabase
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
}
