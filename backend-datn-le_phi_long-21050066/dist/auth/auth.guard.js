"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = AuthGuard;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
function AuthGuard(roles) {
    let MixinAuthGuard = class MixinAuthGuard {
        _userService;
        _configService;
        _jwtService;
        constructor(_userService, _configService, _jwtService) {
            this._userService = _userService;
            this._configService = _configService;
            this._jwtService = _jwtService;
        }
        async canActivate(context) {
            try {
                const request = context.switchToHttp().getRequest();
                const response = context.switchToHttp().getResponse();
                const access_token = request.cookies['access_token'];
                const refresh_token = request.cookies['refresh_token'];
                const payload = { access_token, refresh_token };
                const check_access_token = await this._userService.verify(payload);
                if (!check_access_token.isSuccess) {
                    const result = await this._userService.generateTokens(payload);
                    if (!result.isSuccess)
                        return false;
                    response.cookie('access_token', result.data.access_token, {
                        httpOnly: true,
                        secure: this._configService.get('NODE_ENV') === 'production',
                        sameSite: 'lax',
                        maxAge: 15 * 60 * 1000,
                        path: '/',
                    });
                    response.cookie('refresh_token', result.data.refresh_token, {
                        httpOnly: true,
                        secure: this._configService.get('NODE_ENV') === 'production',
                        sameSite: 'lax',
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                        path: '/',
                    });
                }
                const user = await this._jwtService.decode(refresh_token);
                if (roles.length > 0) {
                    if (!user && !roles.includes(user.isAdmin)) {
                        return false;
                    }
                }
                request.userID = user.id;
                request.isAdmin = user.isAdmin;
                return true;
            }
            catch (e) {
                console.log(e);
                return false;
            }
        }
    };
    MixinAuthGuard = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [user_service_1.UserService,
            config_1.ConfigService,
            jwt_1.JwtService])
    ], MixinAuthGuard);
    return (0, common_1.mixin)(MixinAuthGuard);
}
//# sourceMappingURL=auth.guard.js.map