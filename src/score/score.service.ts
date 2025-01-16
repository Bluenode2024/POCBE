import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { BodyToAddScore } from './models/add-score.model';

@Injectable()
export class ScoreService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async addUserScore(bodyToAddScore: BodyToAddScore) {
    console.log(bodyToAddScore);
    const { data, error } = await this.supabase
      .from('score')
      .insert([
        {
          epoch_id: bodyToAddScore.epochId,
          user_id: bodyToAddScore.userId,
          score: bodyToAddScore.score,
        },
      ])
      .select()
      .single();
    if (error) throw new Error('사용자 기여도 추가 에러');
    return data;
  }
}
