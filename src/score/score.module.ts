import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';

@Module({
  imports: [AuthModule],
  controllers: [ScoreController],
  providers: [ScoreService],
  exports: [ScoreService],
})
export class ScoreModule {}
