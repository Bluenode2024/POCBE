import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateProjectRequestDto } from './dto/create-project-request';

@Injectable()
export class ProjectService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async createProject(
    epochId: string,
    title: string,
    description: string,
    memberData: any,
    startDate: Date,
    endDate: Date,
    leaderId: string,
    score: number,
  ) {
    console.log(leaderId);
    const { data: projectData, error } = await this.supabase
      .from('project')
      .insert([
        {
          epoch_id: epochId,
          project_name: title,
          description: description,
          start_date: startDate,
          end_date: endDate,
          leader_id: leaderId,
          approve_status: false,
          score: score,
        },
      ])
      .select('*')
      .single();
    if (error) throw new Error(`${error.message}`);
    console.log(projectData);
    for (const mem of memberData) {
      await this.supabase.from('project_member').insert([
        {
          project_id: projectData.id,
          members_id: mem.userId,
          role: mem.role,
        },
      ]);
    }
    if (error) throw new Error('프로젝트 생성 에러');
    return projectData;
  }

  async approveProject(
    userId: string,
    data: { adminComment: string },
    projectId: string,
  ) {
    const { data: findAdmin, error: findAdminError } = await this.supabase
      .from('admin')
      .select()
      .eq('user_id', userId)
      .single();
    console.log(findAdmin);
    if (!findAdmin) {
      throw new UnauthorizedException(`admin이 아닙니다.`);
    }
    const { data: adminData, error: adminError } = await this.supabase
      .from('admin')
      .select()
      .eq('user_id', userId)
      .single();
    const currentDateTime = new Date().toISOString();
    const { data: updatedProject, error } = await this.supabase
      .from('project')
      .update([
        {
          admin_comment: data.adminComment,
          approved_at: currentDateTime,
          status: 'Not Started',
          approve_status: true,
          approved_by: adminData.id,
        },
      ])
      .eq('id', projectId)
      .select()
      .single();
    if (error || findAdminError || adminError) throw new Error(error.message);
    return updatedProject;
  }

  async updateProjectContribution(
    projectId: string,
    userId: string,
    contributionScore: number,
  ) {
    const { data, error } = await this.supabase.rpc(
      'update_member_project_contribution',
      {
        p_project_id: projectId,
        p_user_id: userId,
        p_contribution_score: contributionScore,
      },
    );

    if (error) throw error;
    return data;
  }

  async updateMemberProjectContribution(
    projectId: string,
    userId: string,
    contributionScore: number,
  ) {
    const { data, error } = await this.supabase.rpc(
      'update_member_project_contribution',
      {
        p_project_id: projectId,
        p_user_id: userId,
        p_contribution_score: contributionScore,
      },
    );

    if (error) throw error;
    return data;
  }

  async completeProject(
    projectId: string,
    completionStatus: number,
    verificationTxHash: string,
    ipfsHash: string,
  ) {
    const { data, error } = await this.supabase.rpc('complete_project', {
      p_project_id: projectId,
      p_completion_status: completionStatus,
      p_verification_tx_hash: verificationTxHash,
      p_ipfs_hash: ipfsHash,
    });

    if (error) throw error;
    return data;
  }

  async projectRequestRegistration(
    createProjectRequestDto: CreateProjectRequestDto,
  ) {
    const { data, error } = await this.supabase
      .from('project_requests')
      .insert([
        {
          epoch_id: createProjectRequestDto.epochId,
          requested_by: createProjectRequestDto.requestedBy,
          title: createProjectRequestDto.title,
          description: createProjectRequestDto.description,
          proposed_members: createProjectRequestDto.proposedMembers,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
