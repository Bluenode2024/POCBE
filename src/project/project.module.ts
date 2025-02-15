import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { SupabaseService } from '../supabase.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, SupabaseService],
  exports: [ProjectService],
})
export class ProjectModule {}
