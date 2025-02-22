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
  async createReport(dto: CreateReportDto, walletAddress: string) {
    const userId = await this.userService.getUserId(walletAddress);

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

    return data;
  }

  /**
   * 📌 Report Response 생성
   */
  async createReportResponse(userId: string, dto: CreateReportResponseDto) {
    const AdminId = userId;
    const isAdmin = await this.adminService.isAdmin(userId);

    if (!isAdmin) throw new Error('Unauthorized');

    const { data, error } = await this.supabase.from('report_response').insert([
      {
        report_id: dto.report_id,
        admin_id: AdminId,
        response_comment: dto.response_comment,
        created_at: new Date(),
      },
    ]);

    if (error) throw new Error(error.message);

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
