// src/epoch/epoch.module.ts
import { Module } from '@nestjs/common';
import { EpochController } from './epoch.controller';
import { EpochService } from './epoch.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [EpochController],
  providers: [EpochService],
  exports: [EpochService],
})
export class EpochModule {}
