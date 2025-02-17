import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ValidateController } from './validate.controller';
import { ValidateService } from './validate.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [AuthModule, ScheduleModule.forRoot()],
  controllers: [ValidateController],
  providers: [ValidateService],
  exports: [ValidateService],
})
export class ValidateModule {}
