import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ScoreService } from './score.service';
import { BodyToAddScore } from './models/add-score.model';

@Controller('scores')
@UseGuards(AuthGuard)
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}
  @Post()
  async addUserScore(@Body() bodyToAddScore: BodyToAddScore) {
    return this.scoreService.addUserScore(bodyToAddScore);
  }
}
