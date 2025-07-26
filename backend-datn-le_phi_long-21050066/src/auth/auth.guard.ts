import { CanActivate, ExecutionContext, Injectable, mixin } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

export function AuthGuard(roles: number[]) {
  @Injectable()
  class MixinAuthGuard implements CanActivate {
    constructor(
      public readonly _userService: UserService,
      public readonly _configService: ConfigService,
      public readonly _jwtService: JwtService
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        const access_token = request.cookies['access_token'];
        const refresh_token = request.cookies['refresh_token'];
        const payload = { access_token, refresh_token };
        const check_access_token = await this._userService.verify(payload);
        console.log(payload)

        if(!check_access_token.isSuccess){
          const result = await this._userService.generateTokens(payload)
          if(!result.isSuccess) return false;
          response.cookie('access_token', result.data!.access_token, {
            httpOnly: true,
            secure: this._configService.get<string>('NODE_ENV') === 'production',
            sameSite: 'lax', 
            maxAge: 15 * 60 * 1000,
            path: '/',
          });
          response.cookie('refresh_token', result.data!.refresh_token, {
            httpOnly: true,
            secure: this._configService.get<string>('NODE_ENV') === 'production',
            sameSite: 'lax', 
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
          });
        }

        if(roles.length > 0){
          const user = await this._jwtService.decode(refresh_token);
          if (!user || !roles.includes(user.isAdmin)) {
            return false; 
          }
        }

        return true;
      } catch(e){
        console.log(e)
        return false;
      }
    }
  }
  return mixin(MixinAuthGuard);
}
