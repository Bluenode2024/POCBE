import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ValidateService } from '../validate/validate.service';
import { AdminService } from '../admin/admin.service';
import { UserService } from '../user/user.service';
import { CreateReportDto, CreateReportResponseDto } from './dto/report.dto';
@Injectable()
export class ReportService {
  private supabase: SupabaseClient;

  constructor(
    private readonly validateService: ValidateService,
    private readonly adminService: AdminService,
    private readonly userService: UserService,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
  }

  /**
   * 📌 Report 생성
   */
  async createReport(dto: CreateReportDto, userId: string) {
    const { data, error } = await this.supabase
      .from('report')
      .insert([
        {
          user_id: userId,
          validation_id: dto.validation_id,
          reporter_comment: dto.reporter_comment,
          status: 'pending',
          created_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);

    const { data: validation, error: validationError } = await this.supabase
      .from('validation')
      .update([
        {
          status: 'reported',
        },
      ])
      .eq('id', dto.validation_id)
      .select()
      .single();

    if (validationError) throw new Error(validationError.message);

    return data;
  }

  /**
   * 📌 Report Response 생성
   */
  async createReportResponse(userId: string, dto: CreateReportResponseDto) {
    const isAdmin = await this.adminService.isAdmin(userId);

    if (!isAdmin) throw new Error('Unauthorized');

    const { data: AdminId, error: AdminIdError } = await this.supabase
      .from('admin')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (AdminIdError) throw new Error(AdminIdError.message);

    const { data, error } = await this.supabase.from('report_response').insert([
      {
        report_id: dto.report_id,
        admin_id: AdminId.id,
        response_comment: dto.response_comment,
        created_at: new Date(),
      },
    ]);

    if (error) throw new Error(error.message);

    const { error: reportError } = await this.supabase
      .from('report')
      .update({ status: dto.status })
      .eq('id', dto.report_id);

    if (reportError) throw new Error(reportError.message);

    // ✅ dto.status가 'rejected'일 경우 validation status 업데이트
    if (dto.status === 'rejected') {
      const { data: validation, error: validationError } = await this.supabase
        .from('report')
        .select('validation_id')
        .eq('id', dto.report_id)
        .single();

      if (validationError) {
        throw new Error(validationError.message);
      }

      const { error: validationupdateError } = await this.supabase
        .from('validation')
        .update({ status: 'success' }) // ✅ validation status를 success로 업데이트
        .eq('id', validation.validation_id); // ✅ 해당 report_id에 맞는 validation 업데이트

      if (validationupdateError) {
        throw new Error(
          `Validation update failed: ${validationupdateError.message}`,
        );
      }
    }

    return data;
  }

  /**
   * 📌 Report 상태 업데이트
   */
  async updateReportToAccept(reportId: string) {
    const { error } = await this.supabase
      .from('report')
      .update({ status: 'accept' })
      .eq('id', reportId);

    if (error) throw new Error(error.message);
  }

  async updateReportToReject(reportId: string) {
    const { error } = await this.supabase
      .from('report')
      .update({ status: 'reject' })
      .eq('id', reportId);

    if (error) throw new Error(error.message);
  }
}
