import { Exercise } from 'src/entities/exercise.entity';
import { Muscle } from 'src/entities/muscle.entity';
import { DataSource, Repository } from 'typeorm';
import { ExerciseLevel } from 'src/entities/exerciselevel.entity';
import { EvaluationCriteria } from 'src/entities/evaluationcriteria.entity';
import { Position } from 'src/entities/position.entity';
import { Joint } from 'src/entities/joint.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { ScheduleDetail } from 'src/entities/scheduledetail.entity';
import { Result } from 'src/entities/result.entity';
export declare class ExerciseService {
    private readonly dataSource;
    private _exerciseRepository;
    private _muscleRepository;
    private _exerciseLevelRepository;
    private _evaluationCriteria;
    private _positionRepository;
    private _scheduleRepository;
    private _scheduleDetailRepository;
    private _jointRepository;
    private _resultRepository;
    constructor(dataSource: DataSource, _exerciseRepository: Repository<Exercise>, _muscleRepository: Repository<Muscle>, _exerciseLevelRepository: Repository<ExerciseLevel>, _evaluationCriteria: Repository<EvaluationCriteria>, _positionRepository: Repository<Position>, _scheduleRepository: Repository<Schedule>, _scheduleDetailRepository: Repository<ScheduleDetail>, _jointRepository: Repository<Joint>, _resultRepository: Repository<Result>);
    create(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: {
            id: number;
            name: string;
            minAge: number;
            maxAge: number;
            calo: number;
        };
    }>;
    findAll(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: Exercise[];
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    }>;
    findOne(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: Exercise;
    }>;
    delete(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
    }>;
    updateInfo(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: {
            id: number;
            name: string;
            minAge: number;
            maxAge: number;
            calo: number;
        };
    }>;
    updateLevel(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: Exercise | null;
    }>;
    updateCriteria(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
    }>;
    updateModel(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: {
            id: number;
            lastTrainResult: number;
            path: string;
        };
    }>;
    private convertTextToSpeech;
    getExercise(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: any[];
    }>;
    saveStats(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
    }>;
    getExamples(): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: {
            id: any;
            name: any;
            path: string;
        }[];
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    }>;
}
