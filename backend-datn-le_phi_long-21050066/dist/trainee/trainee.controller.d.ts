import { TraineeService } from './trainee.service';
import { Response } from 'express';
export declare class TraineeController {
    private readonly traineeService;
    constructor(traineeService: TraineeService);
    create(payload: any, req: any, res: Response): Promise<void>;
    update(payload: any, req: any, res: Response): Promise<void>;
}
