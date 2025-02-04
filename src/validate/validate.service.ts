import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  CreateValidationDto,
  CreateValidatorDto,
} from './dto/create-validate-dto';

@Injectable()
export class ValidateService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async createValidator(createValidatorDto: CreateValidatorDto) {
    const { data: contractAddressOwner, error: contractAddressOwnerError } =
      await this.supabase
        .from('user')
        .select()
        .eq('wallet_address', createValidatorDto.stakingContractAddress)
        .single();

    if (contractAddressOwnerError) {
      throw new Error(`검증인 찾기 에러: ${contractAddressOwnerError.message}`);
    }
    const { data: validatorData, error: validatorError } = await this.supabase
      .from('validator')
      .insert([
        {
          user_id: contractAddressOwner.id,
          staking_contract_address: createValidatorDto.stakingContractAddress,
        },
      ])
      .select('*')
      .single();
    if (validatorError) throw new Error(`${validatorError.message}`);
    console.log(validatorData);
    return validatorData;
  }

  async createValidation(createValidationDto: CreateValidationDto) {
    // 검증 요청한 테스크의 프로젝트 ID 찾기
    const { data: projectData, error: projectError } = await this.supabase
      .from('task')
      .select()
      .eq('id', createValidationDto.taskId)
      .single();
    if (projectError) {
      throw new Error(`프로젝트 ID 찾기 에러: ${projectError.message}`);
    }
    const projectId = projectData.project_id;

    // 프로젝트 참여자(리더) ID 찾기
    const projectLeader = (
      await this.supabase.from('project').select().eq('id', projectId).single()
    ).data;
    const leaderId = projectLeader.id;

    // 프로젝트 참여자(리더 X) ID 찾기 (1명 이상)
    const projectMembers =
      (
        await this.supabase
          .from('project_member')
          .select()
          .eq('project_id', projectId)
      ).data || [];
    const projectMemberId = projectMembers.map((mem) => mem.members_id);

    // 프로젝트 참여자들을 한 배열로 묶음
    const projectMemberLeaderId = [...new Set([...projectMemberId, leaderId])];

    // 프로젝트에 참여하지 않은 검증인 찾기
    const { data: validatorData, error: validatorError } = await this.supabase
      .from('validator')
      .select();
    if (validatorError) {
      throw new Error(`검증인 불러오기 에러: ${validatorError.message}`);
    }
    const validatorIds = validatorData.map((valid) => valid.id);
    // 프로젝트에 참여하지 않은 검증인 필터링
    const availableValidators = validatorIds.filter(
      (validatorId) => !projectMemberLeaderId.includes(validatorId),
    );

    const randomValidator =
      availableValidators.length > 0
        ? availableValidators[
            Math.floor(Math.random() * availableValidators.length)
          ]
        : null;
    if (randomValidator === null) {
      throw new Error(`적절한 검증인 없음`);
    }

    const { data: validationData, error: validationError } = await this.supabase
      .from('validation')
      .insert([
        {
          vali_id: randomValidator,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (validationError) {
      throw new Error(`검증 에러: ${validationError.message}`);
    }
    return validationData;
  }
}
