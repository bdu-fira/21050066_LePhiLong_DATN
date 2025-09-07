import { ExerciseLevel } from './exerciselevel.entity';
import { Muscle } from './muscle.entity';
import { Position } from './position.entity';
import { ScheduleDetail } from './scheduledetail.entity';
export declare class Exercise {
    id: number;
    name: string;
    minAge: number;
    maxAge: number;
    calo: number;
    lastTrainResult: number;
    path: string;
    levels: ExerciseLevel[];
    muscles: Muscle[];
    positions: Position[];
    scheduleDetails: ScheduleDetail[];
}
