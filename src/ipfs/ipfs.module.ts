import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IPFSService } from './ipfs.service';
import { IPFSController } from './ipfs.controller';

@Module({
  imports: [ConfigModule],
  controllers: [IPFSController], 
  providers: [IPFSService],
  exports: [IPFSService],
})
export class IPFSModule {}
