import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // ✅ JwtModule 추가
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ValidateModule } from '../validate/validate.module';
import { AdminModule } from '../admin/admin.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ValidateModule, AdminModule, UserModule, AuthModule],
  providers: [ReportService],
  controllers: [ReportController],
})
export class ReportModule {}
