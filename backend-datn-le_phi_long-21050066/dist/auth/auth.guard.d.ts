import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
export declare function AuthGuard(roles: number[]): import("@nestjs/common").Type<{
    readonly _userService: UserService;
    readonly _configService: ConfigService;
    readonly _jwtService: JwtService;
    canActivate(context: ExecutionContext): Promise<boolean>;
}>;
