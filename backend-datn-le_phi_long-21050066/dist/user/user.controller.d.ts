import { UserService } from './user.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class UserController {
    private readonly _userService;
    private readonly _configService;
    constructor(_userService: UserService, _configService: ConfigService);
    login(payload: any, res: Response, ip: string): Promise<void>;
    logout(res: Response): Response<any, Record<string, any>>;
    verify(res: Response, req: any): Promise<void>;
    create(payload: JSON, res: Response): Promise<void>;
    findAll(payload: any, res: Response): Promise<void>;
    findOne(payload: any, res: Response): Promise<void>;
    update(payload: any, req: any, res: Response): Promise<void>;
    lostPassword(payload: any, res: Response): Promise<void>;
    updatePassword(payload: any, res: Response): Promise<void>;
    validateResetToken(payload: any, res: Response): Promise<void>;
    remove(req: any, res: Response): Promise<void>;
}
