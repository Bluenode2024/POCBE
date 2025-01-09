import { Injectable, Inject } from '@nestjs/common';
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
  ) {
    // const { data, error } = await this.supabase.rpc('create_project', {
    //   p_title: title,
    //   p_description: description,
    //   p_leader_id: leaderId,
    //   p_member_data: memberData,
    // });
    const { data, error } = await this.supabase
      .from('projects')
      .insert([
        {
          epoch_id: epochId,
          title: title,
          description: description,
          members: memberData,
          start_date: startDate,
          end_date: endDate,
          leader_id: leaderId,
        },
      ])
      .select()
      .single();

    if (error) throw new Error('프로젝트 생성 에러');
    return data;
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

  async submitFreeriderVote(
    projectId: string,
    voterId: string,
    targetUserId: string,
    voteTxHash: string,
  ) {
    const { data, error } = await this.supabase.rpc('submit_freerider_vote', {
      p_project_id: projectId,
      p_voter_id: voterId,
      p_target_user_id: targetUserId,
      p_vote_tx_hash: voteTxHash,
    });

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
