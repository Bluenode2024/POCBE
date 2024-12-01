import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const createSupabaseClient = (
  configService: ConfigService,
): SupabaseClient => {
  return createClient(
    configService.get<string>('SUPABASE_URL'),
    configService.get<string>('SUPABASE_KEY'),
  );
};
