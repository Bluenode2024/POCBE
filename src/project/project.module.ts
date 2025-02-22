import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // ✅ JwtModule 추가
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { SupabaseService } from '../supabase.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProjectController],
  providers: [ProjectService, SupabaseService],
  exports: [ProjectService],
})
export class ProjectModule {}
