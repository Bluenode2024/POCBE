import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateReportDto, UpdateReportDto } from './report.dto';

@Injectable()
export class ReportService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async createReport(createReportDto: CreateReportDto, userId: string) {
    const { data: userData, error: userError } = await this.supabase
      .from('user')
      .select()
      .eq('id', userId)
      .single();
    if (!userData || !userData.approved_at) {
      throw new UnauthorizedException(`리포트를 등록할 권한이 없습니다.`);
    }
    if (userError) {
      throw new BadRequestException(
        `사용자의 승인 여부를 검사하는 중에 에러가 발생하였습니다.: ${userError.message}`,
      );
    }
    const { data: reportData, error: reportError } = await this.supabase
      .from('report')
      .insert([
        {
          user_id: userId,
          content: createReportDto.content,
          staking_contract_address: createReportDto.stakingContractAddress,
          admin_id: createReportDto.adminId,
          status: 'No response',
          validation_id: createReportDto.validationId,
        },
      ])
      .select()
      .single();

    if (reportError) {
      throw new BadRequestException(`리포트 등록 에러: ${reportError.message}`);
    }
    return reportData;
  }

  async updateReport(
    updateReportDto: UpdateReportDto,
    userId: string,
    reportId: string,
  ) {
    const { data: adminData, error: adminError } = await this.supabase
      .from('admin')
      .select()
      .eq('user_id', userId)
      .single();
    if (!adminData) {
      throw new UnauthorizedException(`어드민이 아닙니다.`);
    }
    if (adminError) {
      throw new BadRequestException(
        `어드민 조회 중 에러가 발생하였습니다.: ${adminError.message}`,
      );
    }
    const adminId = adminData.id;
    const { data: reportAdminData, error: reportAdminError } =
      await this.supabase
        .from('report')
        .select()
        .eq('admin_id', adminId)
        .eq('id', reportId)
        .single();
    if (!reportAdminData) {
      throw new UnauthorizedException(`리포트 요청 받은 어드민이 아닙니다.`);
    }

    if (reportAdminError) {
      throw new BadRequestException(
        `어드민 확인 중에 에러가 발생했습니다.: ${adminError.message}`,
      );
    }
    console.log(updateReportDto.responseComment);
    const { data: reportData, error: reportError } = await this.supabase
      .from('report')
      .update({
        status: 'approved',
        response_comment: updateReportDto.responseComment,
      })
      .eq('id', reportId)
      .select()
      .single();

    if (reportError) {
      throw new BadRequestException(
        `리포트 승인 중에 에러가 발생하였습니다.: ${reportError.message}`,
      );
    }

    const validationId = reportData.validation_id;
    console.log(validationId);
    const { data: validationData, error: validationError } = await this.supabase
      .from('validation')
      .update({
        status: 'reported',
      })
      .eq('id', validationId)
      .select()
      .single();
    if (validationError) {
      throw new BadRequestException(
        `검증 업데이트 중에 에러가 발생하였습니다.: ${validationError.message}`,
      );
    }

    const formattedData = {
      ...reportData,
      updatedvalidationData: { ...validationData },
    };
    return formattedData;
  }
}
