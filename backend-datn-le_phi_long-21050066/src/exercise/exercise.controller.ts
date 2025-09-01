import { Controller, Get, Post, Body, Query, Res, Req, UseGuards, Delete, Patch, UseInterceptors, UploadedFile, StreamableFile, UploadedFiles } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ExerciseService } from './exercise.service';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @UseGuards(AuthGuard([0, 1]))
  @Post('create')
  async create(@Body() payload: any, @Req() req: any, @Res() res: Response) {
    const result = await this.exerciseService.create({ ...payload, userId: req.userID, userRole: req.userRole });
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Get('findAll')
  async find(@Query() query: any, @Res() res: Response) {
    const result = await this.exerciseService.findAll(query);
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Get('findOne')
  async findOne(@Query() query: any, @Res() res: Response) {
    const result = await this.exerciseService.findOne(query);
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0]))
  @Delete('delete')
  async delete(@Body() payload: any, @Res() res: Response) {
    const result = await this.exerciseService.delete(payload);
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @UseInterceptors(FileInterceptor('file')) 
  @Patch('updateInfo')
  async updateInfo(@Body() payload: any, @Req() req: any, @Res() res: Response, @UploadedFile() file: any) {
    const result = await this.exerciseService.updateInfo({ ...payload, userId: req.userID, userRole: req.userRole, file });
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Patch('updateLevel')
  async updateLevel(@Body() payload: any, @Req() req: any, @Res() res: Response) {
    const result = await this.exerciseService.updateLevel({ ...payload, userId: req.userID, userRole: req.userRole });
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Patch('updateCriteria')
  async updateCriteria(@Body() payload: any, @Req() req: any, @Res() res: Response) {
    const result = await this.exerciseService.updateCriteria({ ...payload, userId: req.userID });
    res.status(result.statusCode).json(result);
  }


  @UseGuards(AuthGuard([0, 1]))
  @UseInterceptors(AnyFilesInterceptor())
  @Patch('updateModel')
  async updateModel(
    @Body() payload: any, 
    @Res() res: Response, 
    @UploadedFiles() files: any[],
  ) {
    const result = await this.exerciseService.updateModel({ ...payload, files, modelJson: files[0], modelWeights: files[1] });
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Post('getExercise')
  async getExercise(@Body() payload: any, @Req() req: any, @Res() res: Response) {
    const result = await this.exerciseService.getExercise({ ...payload, userId: req.userID, userRole: req.userRole });
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Get('getFile')
  async getFile(@Query() query: any) {
    const file = createReadStream(query.path);
    return new StreamableFile(file);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Get('getExamples')
  async getExamples(@Body() payload: any, @Req() req: any, @Res() res: Response) {
    const result = await this.exerciseService.getExamples();
    res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard([0, 1]))
  @Post('saveStats')
  async saveStats(@Body() payload: any,@Req() req: any, @Res() res: Response) {
    const result = await this.exerciseService.saveStats({date:payload.date, errors: payload.errors, userID: req.userID});
    res.status(result.statusCode).json(result);
  }

}
