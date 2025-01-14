import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { IPFSModule } from '../ipfs/ipfs.module';
import { WalletModule } from '../blockchain/blockchain.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [IPFSModule, WalletModule, JwtModule],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
