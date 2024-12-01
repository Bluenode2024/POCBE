import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';

// 기능 모듈들 import
import { SupabaseModule } from './shared/subabase.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ActivityModule } from './activity/activity.module';
import { ProjectModule } from './project/project.module';
import { EpochModule } from './epoch/epoch.module';
import { IPFSModule } from './ipfs/ipfs.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    // 환경 변수 설정 - 전역으로 설정하여 모든 모듈에서 사용 가능
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Supabase 클라이언트 설정
    SupabaseModule,

    // 기능 모듈들
    AuthModule,
    AdminModule,
    ActivityModule,
    ProjectModule,
    EpochModule,
    IPFSModule,
    WalletModule,
  ],
  // RolesGuard를 전역으로 설정
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
