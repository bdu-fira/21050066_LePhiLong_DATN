import { Controller, Post, Patch, Body, Res, Req, UseGuards } from '@nestjs/common';
import { TraineeService } from './trainee.service';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('trainee')
export class TraineeController {
  constructor(private readonly traineeService: TraineeService) {}

  @UseGuards(AuthGuard([0]))
  @Post('create')
  async create(@Body() payload: any, @Req() req: any, @Res() res: Response) {
    // payload gồm weight, height
    const result = await this.traineeService.create({ ...payload, userId: req.userID });
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0]))
  @Patch('update')
  async update(@Body() payload: any, @Req() req: any, @Res() res: Response) {
    const result = await this.traineeService.update({ ...payload, userId: req.userID });
    res.status(result.statusCode).json(result);
  }
}
