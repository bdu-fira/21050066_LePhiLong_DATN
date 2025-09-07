import { User } from './user.entity';
import { Schedule } from './schedule.entity';
export declare class Trainee {
    id: number;
    weight: number;
    height: number;
    user: User;
    schedules: Schedule[];
}
