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
    title: string,
    description: string,
    leaderId: string,
    memberData: any,
  ) {
    const { data, error } = await this.supabase.rpc('create_project', {
      p_title: title,
      p_description: description,
      p_leader_id: leaderId,
      p_member_data: memberData,
    });

    if (error) throw error;
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
