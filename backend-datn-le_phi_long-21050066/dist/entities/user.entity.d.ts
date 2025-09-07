import { Admin } from './admin.entity';
import { Trainee } from './trainee.entity';
export declare class User {
    id: number;
    name: string;
    gender: number;
    dateOfBirth: string;
    isAdmin: number;
    email: string;
    password: string;
    lastReset: Date | null;
    admin: Admin;
    trainee: Trainee;
}
