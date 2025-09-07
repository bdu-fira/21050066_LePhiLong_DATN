import { Trainee } from 'src/entities/trainee.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
export declare class TraineeService {
    private readonly _traineeRepository;
    private readonly _userRepository;
    constructor(_traineeRepository: Repository<Trainee>, _userRepository: Repository<User>);
    create(payload: {
        weight: number;
        height: number;
        userId: number;
    }): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: Trainee;
    }>;
    update(payload: {
        weight: number;
        height: number;
        userId: number;
    }): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: User | null;
    }>;
}
