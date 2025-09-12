import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Trainee } from 'src/entities/trainee.entity';
import { Admin } from 'src/entities/admin.entity';
export declare class UserService {
    private _userRepository;
    private _traineeRepository;
    private _adminRepository;
    private _jwtService;
    private _configService;
    private _mailerService;
    constructor(_userRepository: Repository<User>, _traineeRepository: Repository<Trainee>, _adminRepository: Repository<Admin>, _jwtService: JwtService, _configService: ConfigService, _mailerService: MailerService);
    login(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: {
            user: any;
            access_token: string;
            refresh_token: string;
        };
    }>;
    verify(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
    }>;
    generateTokens(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: {
            access_token: string;
            refresh_token: string;
        };
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    }>;
    create(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
    }>;
    findAll(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: User[];
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
        data: User | null;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    }>;
    update(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: any;
    }>;
    delete(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
    }>;
    lostPassword(email: string): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
    }>;
    updatePassword(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: User;
    }>;
    validateResetToken(payload: any): Promise<{
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        isSuccess: boolean;
        statusCode: number;
        message: string;
        data: User;
    }>;
}
