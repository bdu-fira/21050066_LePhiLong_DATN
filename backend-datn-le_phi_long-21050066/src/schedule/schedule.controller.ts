import { Body, Controller, Delete, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @UseGuards(AuthGuard([0, 1]))
  @Get('getSchedule')
  async getSchedule(@Req() req: any, @Res() res: Response) {
    const result = await this.scheduleService.getSchedule({
      userId: req.userID,
      userRole: req.userRole,
    });
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Post('create')
  async createWeeklySchedule(@Req() req: any, @Res() res: Response, @Body() payload: any) {
    const result = await this.scheduleService.createWeeklySchedule({ userId: req.userID, body: payload });
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Patch('update')
  async updateWeeklySchedule(@Req() req: any, @Res() res: Response, @Body() payload: any) {
    const result = await this.scheduleService.updateWeeklySchedule({
      ...payload,
      userId: req.userID,
      userRole: req.userRole,
    });
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Delete('delete')
  async deleteSchedule(@Req() req: any, @Res() res: Response) {
    const result = await this.scheduleService.deleteSchedule({
      userId: req.userID,
      userRole: req.userRole,
    });
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Get('getStats')
  async getStats(@Req() req: any, @Res() res: Response) {
    const result = await this.scheduleService.getStats({ userId: req.userID });
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Get('getAnalytics')
  async getAnalytics(@Req() req: any, @Res() res: Response) {
    const result = await this.scheduleService.getAnalytics({ userId: req.userID });
    res.status(result.statusCode).json(result);
  }

}
