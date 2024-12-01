import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    WalletService,
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
  exports: [WalletService],
})
export class WalletModule {}
