import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { BlockchainController } from './blockchain.controller';
import { IPFSModule } from '../ipfs/ipfs.module';

@Module({
  imports: [IPFSModule],
  providers: [
    BlockchainService,
    {
      provide: 'ETHEREUM_PROVIDER',
      useFactory: (configService: ConfigService) => {
        return new ethers.JsonRpcProvider(
          configService.get<string>('ETH_RPC_URL'),
        );
      },
      inject: [ConfigService],
    },
  ],
  controllers: [BlockchainController],
  exports: [BlockchainService],
})
export class BlockchainModule {}
