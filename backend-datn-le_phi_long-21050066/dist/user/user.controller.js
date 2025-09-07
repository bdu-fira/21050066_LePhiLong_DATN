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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const config_1 = require("@nestjs/config");
const auth_guard_1 = require("../auth/auth.guard");
let UserController = class UserController {
    _userService;
    _configService;
    constructor(_userService, _configService) {
        this._userService = _userService;
        this._configService = _configService;
    }
    async login(payload, res) {
        const result = await this._userService.login(payload);
        if (result.isSuccess && result.data) {
            res.cookie('access_token', result.data.access_token, {
                httpOnly: true,
                secure: this._configService.get('NODE_ENV') === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 15 * 60 * 1000
            });
            res.cookie('refresh_token', result.data.refresh_token, {
                httpOnly: true,
                secure: this._configService.get('NODE_ENV') === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
        }
        res.status(result.statusCode).json(result);
    }
    logout(res) {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: this._configService.get('NODE_ENV') === 'production',
            sameSite: 'lax',
            path: '/',
            expires: new Date(0),
        });
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: this._configService.get('NODE_ENV') === 'production',
            sameSite: 'lax',
            path: '/',
            expires: new Date(0),
        });
        return res.json({
            isSuccess: true,
            statusCode: 200,
            message: 'Đã đăng xuất và xóa cookie!'
        });
    }
    async verify(res, req) {
        const result = {
            isSuccess: true,
            statusCode: 200,
            message: 'Xác thực thành công!',
            data: req.isAdmin
        };
        res.status(result.statusCode).json(result);
    }
    async create(payload, res) {
        const result = await this._userService.create({ ...payload, isAdmin: 0 });
        res.status(result.statusCode).json(result);
    }
    async findAll(payload, res) {
        const result = await this._userService.findAll(payload);
        res.status(result.statusCode).json(result);
    }
    async findOne(payload, res) {
        const result = await this._userService.findOne(payload);
        res.status(result.statusCode).json(result);
    }
    async update(payload, req, res) {
        const result = await this._userService.update({ ...payload, id: req.userID });
        res.status(result.statusCode).json(result);
    }
    async lostPassword(payload, res) {
        const result = await this._userService.lostPassword(payload.email);
        res.status(result.statusCode).json(result);
    }
    async updatePassword(payload, res) {
        const result = await this._userService.updatePassword(payload);
        res.status(result.statusCode).json(result);
    }
    async validateResetToken(payload, res) {
        const result = await this._userService.validateResetToken(payload);
        res.status(result.statusCode).json(result);
    }
    async remove(req, res) {
        const payload = { id: req.userID };
        const result = await this._userService.delete(payload);
        if (result.statusCode === 200) {
            res.clearCookie('access_token', {
                httpOnly: true,
                secure: this._configService.get('NODE_ENV') === 'production',
                sameSite: 'lax',
                path: '/',
                expires: new Date(0),
            });
            res.clearCookie('refresh_token', {
                httpOnly: true,
                secure: this._configService.get('NODE_ENV') === 'production',
                sameSite: 'lax',
                path: '/',
                expires: new Date(0),
            });
        }
        res.status(result.statusCode).json(result);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([])),
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([])),
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('findAll'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([1, 0])),
    (0, common_1.Get)('/findOne'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([1, 0])),
    (0, common_1.Patch)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('lost-password'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "lostPassword", null);
__decorate([
    (0, common_1.Post)('update-password'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updatePassword", null);
__decorate([
    (0, common_1.Get)('validate-reset-token'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "validateResetToken", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([1])),
    (0, common_1.Delete)('delete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "remove", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        config_1.ConfigService])
], UserController);
//# sourceMappingURL=user.controller.js.map