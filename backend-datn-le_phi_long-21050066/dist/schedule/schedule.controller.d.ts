import { Response } from 'express';
import { ScheduleService } from './schedule.service';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    getSchedule(req: any, res: Response): Promise<void>;
    createWeeklySchedule(req: any, res: Response, payload: any): Promise<void>;
    updateWeeklySchedule(req: any, res: Response, payload: any): Promise<void>;
    deleteSchedule(req: any, res: Response): Promise<void>;
    getStats(req: any, res: Response): Promise<void>;
    getAnalytics(req: any, res: Response): Promise<void>;
    getAllStats(res: Response): Promise<void>;
}
