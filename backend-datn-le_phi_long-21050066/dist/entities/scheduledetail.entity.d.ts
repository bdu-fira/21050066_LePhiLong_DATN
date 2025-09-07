import { Schedule } from './schedule.entity';
import { Exercise } from './exercise.entity';
import { Result } from './result.entity';
export declare class ScheduleDetail {
    id: number;
    scheduleID: number;
    exerciseID: number;
    set: number;
    rep: number;
    isTrained: number;
    date: string;
    schedule: Schedule;
    exercise: Exercise;
    results: Result[];
}
