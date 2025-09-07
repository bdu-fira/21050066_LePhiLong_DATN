import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { ExerciseService } from './exercise.service';
export declare class ExerciseController {
    private readonly exerciseService;
    constructor(exerciseService: ExerciseService);
    create(payload: any, req: any, res: Response): Promise<void>;
    find(query: any, res: Response): Promise<void>;
    findOne(query: any, res: Response): Promise<void>;
    delete(payload: any, res: Response): Promise<void>;
    updateInfo(payload: any, req: any, res: Response, file: any): Promise<void>;
    updateLevel(payload: any, req: any, res: Response): Promise<void>;
    updateCriteria(payload: any, req: any, res: Response): Promise<void>;
    updateModel(payload: any, res: Response, files: any[]): Promise<void>;
    getExercise(payload: any, req: any, res: Response): Promise<void>;
    getFile(query: any): Promise<StreamableFile>;
    getExamples(res: Response): Promise<void>;
    saveStats(payload: any, req: any, res: Response): Promise<void>;
}
