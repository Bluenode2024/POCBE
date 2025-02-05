import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [AuthModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
