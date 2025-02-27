import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
  Logger,
  OnModuleInit,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  CreateValidationDto,
  CreateValidatorDto,
  UpdateValidationDto,
} from './validate.dto';

@Injectable()
export class ValidateService implements OnModuleInit {
  private readonly logger = new Logger(ValidateService.name);
  private activeTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  // 검증 기간 카운트 타이머 초기화
  async onModuleInit() {
    this.logger.log('리포트 기간 카운트 타이머 초기화');

    // 상태가 pending인 검증 조회
    const { data: pendingValidations } = await this.supabase
      .from('validation')
      .select()
      .eq('status', 'pending');

    // pending인 검증들의 검증 기간 타이머 설정
    for (const vali of pendingValidations) {
      const currentTimeMinusCreatedAt =
        new Date().getTime() - new Date(vali.created_at).getTime(); // 현재 시간 - 검증 생성 시간
      const remainingTime = 24 * 60 * 60 * 1000 - currentTimeMinusCreatedAt; // 타이머의 남은 시간 계산

      if (remainingTime > 0) {
        // 타이머 시간이 아직 남았다면 검증 기간의 남은 기간 재설정
        this.setValidationPeriodTimer(vali.id, remainingTime);
      } else {
        // 타이머를 초과했다면 검증인 재할당
        await this.reassignValidator(vali.id);
      }
    }

    // 상태가 validating인 검증 조회
    const { data: successValidations } = await this.supabase
      .from('validation')
      .select()
      .eq('status', 'validating');

    for (const vali of successValidations) {
      const currentTimeMinusCreatedAt =
        new Date().getTime() - new Date(vali.created_at).getTime(); // 현재 시간 - 검증 생성 시간
      const remainingTime = 24 * 60 * 60 * 1000 - currentTimeMinusCreatedAt; // 타이머의 남은 시간 계산

      if (remainingTime > 0) {
        // 타이머 시간이 아직 남았다면 리포트의 남은 기간 재설정
        this.setReportPeriodTimer(vali.id, remainingTime);
      } else {
        // 타이머를 초과했다면 검증 success로 업데이트
        this.updateValidationSuccess(vali.id);
      }
    }
  }

  // 리포트 기간이 지난 validating 검증 업데이트
  async updateValidationSuccess(validationId: string) {
    const { error: validationError } = await this.supabase
      .from('validation')
      .update({
        status: 'success',
      })
      .eq('id', validationId);

    if (validationError) {
      this.logger.error(
        `검증 상태를 변경하던 중에 에러가 발생하였습니다: ${validationError.message}`,
      );
    }
  }

  // 검증인 등록
  async createValidator(createValidatorDto: CreateValidatorDto) {
    const { data: contractAddressOwner, error: contractAddressOwnerError } =
      await this.supabase
        .from('user')
        .select()
        .eq('wallet_address', createValidatorDto.walletAddress)
        .single();

    if (contractAddressOwnerError) {
      throw new BadRequestException(
        `컨트랙트 주소 소유자 조회 중에 에러가 발생하였습니다: ${contractAddressOwnerError.message}`,
      );
    }

    // 검증인 등록
    const { data: validatorData, error: validatorError } = await this.supabase
      .from('validator')
      .insert([
        {
          user_id: contractAddressOwner.id,
          staking_contract_address: createValidatorDto.walletAddress,
        },
      ])
      .select('*')
      .single();

    if (validatorError)
      throw new BadRequestException(
        `검증인 조회 중에 에러가 발생하였습니다: ${validatorError.message}`,
      );

    return validatorData;
  }

  // 검증 생성
  async createValidation(createValidationDto: CreateValidationDto) {
    // 프로젝트 참여자들 조회
    const projectMembers = await this.findProjectMembers(
      createValidationDto.taskId,
    );

    // 유효한 검증인 조회
    const validValidator = await this.findValidValidator(projectMembers);

    // 검증 생성
    const { data: validationData, error: validationError } = await this.supabase
      .from('validation')
      .insert([
        {
          vali_id: validValidator,
          status: 'pending',
          task_id: createValidationDto.taskId,
        },
      ])
      .select()
      .single();

    if (validationError) {
      throw new BadRequestException(
        `검증 생성 중에 에러가 발생하였습니다: ${validationError.message}`,
      );
    }

    // 검증 생성과 동시에 타이머 설정 (시작)
    this.setValidationPeriodTimer(validationData.id, 24 * 60 * 60 * 1000);

    return validationData;
  }

  // 타이머(검증 기간) 설정
  private setValidationPeriodTimer(
    validationId: string,
    validationPeriod: number,
  ) {
    this.logger.log(
      `검증 ID에 대한 timeout 설정: 검증 ID - ${validationId} / timeout - ${validationPeriod / 1000}s`,
    );

    // 지정된 시간(24시간)이 지나면 검증인 재할당
    const timeout = setTimeout(async () => {
      await this.reassignValidator(validationId);
    }, validationPeriod);

    this.activeTimers.set(validationId, timeout);
  }

  // 타이머(리포트 기간) 설정
  private setReportPeriodTimer(validationId: string, reportPeriod: number) {
    this.logger.log(
      `검증 ID에 대한 timeout 설정: 검증 ID - ${validationId} / timeout - ${reportPeriod / 1000}s`,
    );

    // 지정된 시간(24시간)이 지나면 검증인 재할당
    const timeout = setTimeout(async () => {
      await this.updateValidationSuccess(validationId);
    }, reportPeriod);

    this.activeTimers.set(validationId, timeout);
  }

  // 검증인 재할당
  private async reassignValidator(validationId: string) {
    // validationId에 해당하는 검증 조회
    const { data: validationData, error: validationError } = await this.supabase
      .from('validation')
      .select()
      .eq('id', validationId)
      .single();

    if (validationError) {
      this.logger.error(
        `검증 조회 중에 에러가 발생하였습니다: ${validationError.message}`,
      );
    }
    const validator = validationData.vali_id; // 리포트 기간이 지난 검증의 검증인

    // 프로젝트 참여자들 조회
    const projectMembers = await this.findProjectMembers(
      validationData.task_id,
    );

    // 프로젝트 참여자들과 현재 검증인을 한 배열로 묶음
    const currnetValidatorProjectMembers = [
      ...new Set([...projectMembers, validator]),
    ];

    // 유효한 검증인 조회
    const validValidator = await this.findValidValidator(
      currnetValidatorProjectMembers,
    );

    // 검증인 재할당
    const { data: valiData, error: valiError } = await this.supabase
      .from('validation')
      .update([
        {
          vali_id: validValidator,
          created_at: new Date(),
        },
      ])
      .eq('id', validationId)
      .select()
      .single();

    if (valiError) {
      throw new Error(`검증 에러: ${valiError.message}`);
    }

    // 검증인 및 created_at 업데이트하고 타이머 재시작
    this.setValidationPeriodTimer(validationId, 24 * 60 * 60 * 1000);
    return valiData;
  }

  // 검증 업데이트 (검증인이 테스크 완수 인정, status를 validating으로 업데이트)
  async updateValidation(
    updateValidationDto: UpdateValidationDto,
    userId: string,
    validationId: string,
  ) {
    // 해당 검증 조회
    const { data: validationData, error: validationError } = await this.supabase
      .from('validation')
      .select()
      .eq('id', validationId)
      .single();
    if (validationError) {
      throw new BadRequestException(
        `검증 조회 중에 에러가 발생하였습니다: ${validationError.message}`,
      );
    }
    const validatorId = validationData.vali_id;

    // 해당 검증의 검증인 조회
    const { data: checkValidator, error: checkValidatorError } =
      await this.supabase
        .from('validator')
        .select()
        .eq('id', validatorId)
        .single();

    // 현재 사용자가 검증인인지 확인
    if (checkValidator.user_id != userId) {
      throw new UnauthorizedException('검증인이 아닙니다.');
    }
    if (checkValidatorError) {
      throw new BadRequestException(
        `검증인 확인 중에 에러가 발생하였습니다: ${checkValidatorError.message}`,
      );
    }

    // 테스크 완수 인정
    const { data: updateValidationData, error: updateValidationError } =
      await this.supabase
        .from('validation')
        .update({
          status: 'validating',
          comment: updateValidationDto.comment,
          reward_contract_address: updateValidationDto.rewardContractAddress,
          created_at: new Date(),
        })
        .eq('id', validationId)
        .select()
        .single();

    if (updateValidationError) {
      throw new BadRequestException(
        `검증 완수 업데이트 중에 에러가 발생하였습니다: ${updateValidationError.message}`,
      );
    }

    // 검증 업데이트와 동시에 리포트 기간 시작
    this.setReportPeriodTimer(validationId, 24 * 60 * 60 * 1000);

    return updateValidationData;
  }

  // 프로젝트 참여자들 조회 (필터링하기 위함)
  async findProjectMembers(taskId: string) {
    // 검증 요청한 테스크의 프로젝트 ID 찾기
    const { data: projectData, error: projectError } = await this.supabase
      .from('task')
      .select()
      .eq('id', taskId)
      .single();
    if (projectError) {
      throw new BadRequestException(
        `프로젝트 ID 조회 중에 에러가 발생하였습니다: ${projectError.message}`,
      );
    }
    const projectId = projectData.project_id;

    // 프로젝트 참여자(리더) ID 조회
    const projectLeader = (
      await this.supabase.from('project').select().eq('id', projectId).single()
    ).data;
    const leaderId = projectLeader.id;

    // 프로젝트 참여자(리더 X) ID 조회 (1명 이상)
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

    return projectMemberLeaderId;
  }

  // 유효한 검증인 조회
  async findValidValidator(notValidValidators: string[]) {
    // 프로젝트에 참여하지 않은 검증인 조회
    const { data: validatorData, error: validatorError } = await this.supabase
      .from('validator')
      .select();
    if (validatorError) {
      throw new BadRequestException(
        `검증인을 불러오는 중에 에러가 발생하였습니다: ${validatorError.message}`,
      );
    }
    const validatorIds = validatorData.map((valid) => valid.id);

    // 프로젝트에 참여하지 않은 검증인 필터링
    const availableValidators = validatorIds.filter(
      (validatorId) => !notValidValidators.includes(validatorId),
    );

    // 최종적으로 검증인을 랜덤으로 지정
    const randomValidator =
      availableValidators.length > 0
        ? availableValidators[
            Math.floor(Math.random() * availableValidators.length)
          ]
        : null;
    if (randomValidator === null) {
      throw new NotFoundException(`적절한 검증인이 없습니다.`);
    }

    return randomValidator;
  }
  // 검증의 status를 reported로 변경
  async updateValidationToReported(validationId: string) {
    const { error } = await this.supabase
      .from('validation')
      .update({ status: 'reported' })
      .eq('id', validationId);

    if (error)
      throw new BadRequestException(
        `검증 완수 업데이트 중에 에러가 발생하였습니다: ${error.message}`,
      );
    return { message: '검증 상태를 성공적으로 reported로 업데이트하였습니다.' };
  }

  // status가 reported인 validation 조회
  async getReportedValidation() {
    const { data, error } = await this.supabase
      .from('validation')
      .select('*')
      .eq('status', 'reported');

    if (error) throw new Error(error.message);

    return data;
  }
}
