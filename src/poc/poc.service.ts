import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreatePocDto } from './dto/create-poc.dto';
import { CreateTaskDto } from './dto/create-task-dto';

@Injectable()
export class PocService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}
  async createPoc(createPocDto: CreatePocDto, userId: string) {
    const { data: findAdmin, error: findAdminError } = await this.supabase
      .from('admin')
      .select()
      .eq('user_id', userId)
      .single();
    console.log('findAdmin', findAdmin);
    if (!findAdmin || findAdmin.permission != 'Initial') {
      throw new UnauthorizedException(`이니셜 어드민이 아닙니다.`);
    }

    if (findAdminError) {
      throw new Error(`어드민 검사 에러 ${findAdminError.message}`);
    }

    const { data: pocData, error: pocDataError } = await this.supabase
      .from('poc')
      .insert([
        {
          entity: createPocDto.entity,
          category: createPocDto.category,
          description: createPocDto.description,
          score: createPocDto.score,
          epoch_id: createPocDto.epoch_id,
          signature: createPocDto.signature,
        },
      ])
      .select()
      .single();

    if (pocDataError) {
      throw new Error(`POC 생성 에러: ${pocDataError.message}`);
    }
    return pocData;
  }

  async createTask(
    createTaskDto: CreateTaskDto,
    userId: string,
    pocId: string,
  ) {
    const { data: taskData, error: taskError } = await this.supabase
      .from('task')
      .insert([
        {
          IPFS_url: createTaskDto.IPFSUrl,
          user_id: userId,
          poc_id: pocId,
          score: createTaskDto.score,
          project_id: createTaskDto.projectId,
        },
      ])
      .select()
      .single();

    if (taskError) {
      throw new Error(`task 생성 에러: ${taskError.message}`);
    }

    return taskData;
  }
}
