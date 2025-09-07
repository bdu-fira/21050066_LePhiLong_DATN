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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("../entities/user.entity");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const mailer_1 = require("@nestjs-modules/mailer");
const trainee_entity_1 = require("../entities/trainee.entity");
let UserService = class UserService {
    _userRepository;
    _traineeRepository;
    _jwtService;
    _configService;
    _mailerService;
    constructor(_userRepository, _traineeRepository, _jwtService, _configService, _mailerService) {
        this._userRepository = _userRepository;
        this._traineeRepository = _traineeRepository;
        this._jwtService = _jwtService;
        this._configService = _configService;
        this._mailerService = _mailerService;
    }
    async login(payload) {
        try {
            const user = await this._userRepository.findOne({
                where: {
                    email: payload.email
                },
                relations: ['trainee'],
            });
            if (!user) {
                return {
                    isSuccess: false,
                    statusCode: 404,
                    message: 'Người dùng không tồn tại!'
                };
            }
            const is_password_match = await bcrypt.compare(payload.password, user.password);
            if (!is_password_match) {
                return {
                    isSuccess: false,
                    statusCode: 401,
                    message: 'Sai mật khẩu, vui lòng kiểm tra lại thông tin!'
                };
            }
            const access_token_payload = JSON.parse(JSON.stringify(user));
            delete access_token_payload.password;
            const access_token = await this._jwtService.signAsync(access_token_payload);
            const refresh_token = await this._jwtService.signAsync(access_token_payload, { expiresIn: this._configService.get('JWT_REFRESH_TOKEN_EXP') });
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Đăng nhập thành công',
                data: {
                    user: access_token_payload,
                    access_token: access_token,
                    refresh_token: refresh_token
                }
            };
        }
        catch (e) {
            console.log(e);
            return {
                isSuccess: false,
                statusCode: 500,
                message: 'Lỗi hệ thống, vui lòng thử lại sau!'
            };
        }
    }
    async verify(payload) {
        try {
            await this._jwtService.verifyAsync(payload.access_token);
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Xác thực thành công!',
            };
        }
        catch (e) {
            return {
                isSuccess: false,
                statusCode: 401,
                message: 'Access token không hợp lệ!'
            };
        }
    }
    async generateTokens(payload) {
        try {
            const decoded_payload = await this._jwtService.verifyAsync(payload.refresh_token);
            delete decoded_payload.iat;
            delete decoded_payload.exp;
            const access_token = await this._jwtService.signAsync(decoded_payload);
            const refresh_token = await this._jwtService.signAsync(decoded_payload, { expiresIn: this._configService.get('JWT_REFRESH_TOKEN_EXP') });
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Tạo token thành công!',
                data: {
                    access_token: access_token,
                    refresh_token: refresh_token
                }
            };
        }
        catch (e) {
            return {
                isSuccess: false,
                statusCode: 401,
                message: 'Refresh token không hợp lệ!'
            };
        }
    }
    async create(payload) {
        try {
            const user = await this._userRepository.findOne({
                where: {
                    email: payload.email
                }
            });
            if (user) {
                return {
                    isSuccess: false,
                    statusCode: 409,
                    message: 'Email đã tồn tại!'
                };
            }
            if (payload.hasOwnProperty('password')) {
                payload.password = await bcrypt.hash(payload.password, parseInt(this._configService.get('BCRYPT_ROUNDS')));
            }
            const new_user = new user_entity_1.User();
            Object.assign(new_user, payload);
            await this._userRepository.save(new_user);
            const new_trainee = new trainee_entity_1.Trainee();
            new_trainee.id = new_user.id;
            await this._traineeRepository.save(new_trainee);
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Tạo người dùng thành công!'
            };
        }
        catch (e) {
            return {
                isSuccess: false,
                statusCode: 500,
                message: 'Lỗi hệ thống, vui lòng thử lại sau.',
            };
        }
    }
    async findAll(payload) {
        try {
            const users = await this._userRepository.find();
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Tìm thành công',
                data: users
            };
        }
        catch (e) {
            return {
                isSuccess: false,
                statusCode: 500,
                message: 'Lỗi hệ thống, vui lòng thử lại sau.',
            };
        }
    }
    async findOne(payload) {
        try {
            const user = await this._userRepository.findOne({
                where: {
                    id: payload.id
                }
            });
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Tìm thành công',
                data: user
            };
        }
        catch (e) {
            return {
                isSuccess: false,
                statusCode: 500,
                message: 'Lỗi hệ thống, vui lòng thử lại sau.',
            };
        }
    }
    async update(payload) {
        try {
            let user = await this._userRepository.findOne({
                where: {
                    id: payload.id
                }
            });
            if (!user) {
                return {
                    isSuccess: false,
                    statusCode: 404,
                    message: 'Người dùng không tồn tại!'
                };
            }
            const checkUserEmail = await this._userRepository.findOne({
                where: {
                    email: payload.email,
                    id: (0, typeorm_1.Not)(payload.id)
                },
            });
            if (checkUserEmail) {
                return {
                    isSuccess: false,
                    statusCode: 409,
                    message: 'Email đã tồn tại!'
                };
            }
            if (payload.hasOwnProperty('password') && payload.password !== '') {
                payload.password = await bcrypt.hash(payload.password, parseInt(this._configService.get('BCRYPT_ROUNDS')));
            }
            else {
                delete payload.password;
            }
            Object.assign(user, payload);
            const result = await this._userRepository.save(user);
            const updated_user = new user_entity_1.User();
            Object.assign(updated_user, result);
            delete updated_user.password;
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Cập nhật thành công!',
                data: updated_user
            };
        }
        catch (e) {
            return {
                isSuccess: false,
                statusCode: 500,
                message: 'Lỗi hệ thống, vui lòng thử lại sau.',
            };
        }
    }
    async delete(payload) {
        try {
            let user = await this._userRepository.findOne({
                where: {
                    id: payload.id
                }
            });
            if (!user) {
                return {
                    isSuccess: false,
                    statusCode: 404,
                    message: 'Người dùng không tồn tại!'
                };
            }
            await this._userRepository.remove(user);
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Xóa thành công!'
            };
        }
        catch (e) {
            return {
                isSuccess: false,
                statusCode: 500,
                message: 'Lỗi hệ thống, vui lòng thử lại sau.',
            };
        }
    }
    async lostPassword(email) {
        try {
            const user = await this._userRepository.findOne({
                where: { email: email }
            });
            if (!user) {
                return {
                    isSuccess: false,
                    statusCode: 404,
                    message: 'Người dùng không tồn tại!'
                };
            }
            const payload = { email };
            const expiresIn = this._configService.get('JWT_RESET_PASSWORD_TOKEN_EXP') || '15m';
            const resetToken = await this._jwtService.signAsync(payload, { expiresIn });
            const resetLink = `${this._configService.get('SITE_URL')}/quen-mat-khau/${resetToken}`;
            const lastReset = await this._jwtService.decode(resetToken).iat;
            user.lastReset = new Date(lastReset * 1000);
            await this._userRepository.save(user);
            await this._mailerService.sendMail({
                to: email,
                subject: 'Khôi phục mật khẩu | AI Fitness',
                template: './reset-password.hbs',
                context: { resetLink },
            });
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Đã gửi hướng dẫn khôi phục mật khẩu.',
            };
        }
        catch (e) {
            console.log(e);
            return {
                isSuccess: false,
                statusCode: 500,
                message: 'Lỗi hệ thống, vui lòng thử lại sau.',
            };
        }
    }
    async updatePassword(payload) {
        try {
            const validation = await this.validateResetToken(payload);
            if (!validation.isSuccess) {
                return validation;
            }
            const user = validation.data;
            const saltRounds = parseInt(this._configService.get('BCRYPT_ROUNDS')) || 10;
            user.password = await bcrypt.hash(payload.password, saltRounds);
            await this._userRepository.save(user);
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Reset mật khẩu thành công!',
            };
        }
        catch (e) {
            console.log(e);
            return {
                isSuccess: false,
                statusCode: 500,
                message: 'Lỗi hệ thống, vui lòng thử lại sau.',
            };
        }
    }
    async validateResetToken(payload) {
        try {
            const decoded = await this._jwtService.verifyAsync(payload.token);
            const user = await this._userRepository.findOne({
                where: { email: decoded.email }
            });
            if (!user) {
                return {
                    isSuccess: false,
                    statusCode: 404,
                    message: 'Người dùng không tồn tại!',
                };
            }
            if (!user.lastReset || user.lastReset.getTime() / 1000 > decoded.iat) {
                return {
                    isSuccess: false,
                    statusCode: 401,
                    message: 'Token đã hết hạn!',
                };
            }
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Token hợp lệ!',
                data: user,
            };
        }
        catch (err) {
            return {
                isSuccess: false,
                statusCode: 401,
                message: 'Token không hợp lệ',
            };
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_2.InjectRepository)(trainee_entity_1.Trainee)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        mailer_1.MailerService])
], UserService);
//# sourceMappingURL=user.service.js.map