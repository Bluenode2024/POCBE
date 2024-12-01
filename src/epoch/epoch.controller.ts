import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EpochService } from './epoch.service';
import { CreateEpochDto } from './dto/create-epoch.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('epochs')
@Controller('epochs')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class EpochController {
  constructor(private readonly epochService: EpochService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '새로운 에포크 생성' })
  @ApiResponse({
    status: 201,
    description: '에포크가 성공적으로 생성됨',
  })
  async createEpoch(@Body() createEpochDto: CreateEpochDto) {
    return this.epochService.createEpoch(createEpochDto);
  }

  @Get('current')
  @ApiOperation({ summary: '현재 활성화된 에포크 조회' })
  @ApiResponse({
    status: 200,
    description: '현재 활성화된 에포크 정보',
  })
  async getCurrentEpoch() {
    return this.epochService.getCurrentEpoch();
  }

  @Post(':id/settle')
  @Roles('admin')
  @ApiOperation({ summary: '에포크 정산' })
  @ApiResponse({
    status: 200,
    description: '에포크 정산이 완료됨',
  })
  async settleEpoch(
    @Param('id') epochId: string,
    @Body('adminId') adminId: string,
  ) {
    return this.epochService.settleEpoch(epochId, adminId);
  }

  @Get(':id/rewards')
  @ApiOperation({ summary: '에포크 보상 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '에포크 보상 정보',
  })
  async getEpochRewards(@Param('id') epochId: string) {
    return this.epochService.getEpochRewards(epochId);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: '에포크 활동 내역 조회' })
  @ApiResponse({
    status: 200,
    description: '에포크 활동 내역',
  })
  async getEpochActivities(
    @Param('id') epochId: string,
    @Query('userId') userId?: string,
  ) {
    return this.epochService.getEpochActivities(epochId, userId);
  }
}
