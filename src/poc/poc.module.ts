import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PocController } from './poc.controller';
import { PocService } from './poc.service';

@Module({
  imports: [AuthModule],
  controllers: [PocController],
  providers: [PocService],
  exports: [PocService],
})
export class PocModule {}
