import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ValidateService } from './validate.service';
import {
  CreateValidationDto,
  CreateValidatorDto,
  UpdateValidationDto,
} from './validate.dto';

@Controller('validate')
@UseGuards(AuthGuard)
export class ValidateController {
  constructor(private readonly validateService: ValidateService) {}
  @Post('validator')
  async CreateValidator(@Body() createValidatorDto: CreateValidatorDto) {
    return this.validateService.createValidator(createValidatorDto);
  }

  @Post('validation')
  async CreateValidation(
    @Body() createValidationDto: CreateValidationDto,
    //@Request() req,
  ) {
    // const userId = req.user.userId;
    return this.validateService.createValidation(createValidationDto);
  }

  @Patch('validation/:validationId')
  async UpdateValidation(
    @Body() updateValidationDto: UpdateValidationDto,
    @Request() req,
    @Param('validationId') validationId,
  ) {
    const userId = req.user.userId;
    return this.validateService.updateValidation(
      updateValidationDto,
      userId,
      validationId,
    );
  }

  @Patch('reported/:id')
  async updateValidationToReported(@Param('id') validationId: string) {
    return this.validateService.updateValidationToReported(validationId);
  }

  /**
   * ✅ Reported 상태인 Validation 가져오기
   */
  @Get('reported')
  async getReportedValidation() {
    return this.validateService.getReportedValidation();
  }
}
