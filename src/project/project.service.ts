import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';

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
      'update_project_contribution',
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

  async createProjectTask(createProjectTaskDto: CreateProjectTaskDto) {
    const { title, description, contribute_score, task_url, deadline } =
      createProjectTaskDto;
    const { data, error } = await this.supabase.from('project_tasks').insert([
      {
        title,
        description,
        contribute_score,
        task_url,
        deadline,
      },
    ]);
    if (error) throw error;
    return data;
  }
}
