import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PocService } from './poc.service';
import { CreatePocDto } from './dto/create-poc.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateTaskDto } from './dto/create-task-dto';

@Controller('poc')
@UseGuards(AuthGuard)
export class PocController {
  constructor(private readonly pocService: PocService) {}
  @Post()
  async CreatePoc(@Body() createPocDto: CreatePocDto, @Request() req) {
    const userId = req.user.userId;
    return this.pocService.createPoc(createPocDto, userId);
  }

  @Post(':pocId/task')
  async CreateTask(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req,
    @Param('pocId') pocId,
  ) {
    const userId = req.user.userId;
    return this.pocService.createTask(createTaskDto, userId, pocId);
  }
}
