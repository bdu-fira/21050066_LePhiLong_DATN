import { Repository } from 'typeorm';
import { Schedule } from 'src/entities/schedule.entity';
import { ScheduleDetail } from 'src/entities/scheduledetail.entity';
import { Exercise } from 'src/entities/exercise.entity';
import { Muscle } from 'src/entities/muscle.entity';
import { ExerciseLevel } from 'src/entities/exerciselevel.entity';
import { Trainee } from 'src/entities/trainee.entity';
import { Result } from 'src/entities/result.entity';
export declare class ScheduleService {
    private scheduleRepo;
    private scheduleDetailRepo;
    private exerciseRepo;
    private levelRepo;
    private muscleRepo;
    private traineeRepo;
    private resultRepo;
    constructor(scheduleRepo: Repository<Schedule>, scheduleDetailRepo: Repository<ScheduleDetail>, exerciseRepo: Repository<Exercise>, levelRepo: Repository<ExerciseLevel>, muscleRepo: Repository<Muscle>, traineeRepo: Repository<Trainee>, resultRepo: Repository<Result>);
    getSchedule(payload: any): Promise<{
        statusCode: number;
        message: string;
        data: {
            weeks: any[];
        };
    }>;
    createWeeklySchedule(input: any): Promise<any>;
    generateSchedule(input: any): Promise<any>;
    clamp(n: any, a: any, b: any): number;
    wd(i: any): string;
    nextMonday(): Date;
    distribute(n: any): boolean[];
    localDate(d: Date): string;
    updateWeeklySchedule(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: {
            scheduleId: number;
            adjusted: number;
            newLevel: number;
        };
    }>;
    deleteSchedule(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
    }>;
    getStats(payload: any): Promise<{
        statusCode: number;
        data: {
            summary: {
                progressText: string;
                trainedExercises: number;
                totalExercises: number;
                calories: number;
                wrongActions: number;
            };
            days: never[];
        };
        message?: undefined;
    } | {
        statusCode: number;
        data: {
            summary: {
                progressText: string;
                trainedExercises: number;
                totalExercises: number;
                calories: number;
                wrongActions: number;
            };
            days?: undefined;
        };
        message?: undefined;
    } | {
        statusCode: number;
        message: string;
        data?: undefined;
    }>;
    getAnalytics(payload: any): Promise<{
        statusCode: number;
        data: {
            summary: {
                totalWrong: number;
                stage: {
                    early: {
                        count: number;
                        percent: number;
                    };
                    mid: {
                        count: number;
                        percent: number;
                    };
                    late: {
                        count: number;
                        percent: number;
                    };
                };
            };
            topExercises: {
                exerciseID: number;
                exerciseName: string;
                wrongCount: number;
            }[];
        };
        message?: undefined;
    } | {
        statusCode: number;
        message: string;
        data?: undefined;
    }>;
    getAllStats(): Promise<any>;
}
