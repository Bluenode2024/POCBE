import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { IPFSModule } from '../ipfs/ipfs.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [IPFSModule, WalletModule],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
