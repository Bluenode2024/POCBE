// src/epoch/epoch.module.ts
import { Module } from '@nestjs/common';
import { EpochController } from './epoch.controller';
import { EpochService } from './epoch.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [BlockchainModule, AuthModule],
  controllers: [EpochController],
  providers: [EpochService],
  exports: [EpochService],
})
export class EpochModule {}
