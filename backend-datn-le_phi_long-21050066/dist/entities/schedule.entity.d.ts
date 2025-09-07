import { Trainee } from './trainee.entity';
import { ScheduleDetail } from './scheduledetail.entity';
export declare class Schedule {
    id: number;
    traineeID: number;
    level: number;
    isTraining: number;
    trainee: Trainee;
    details: ScheduleDetail[];
}
