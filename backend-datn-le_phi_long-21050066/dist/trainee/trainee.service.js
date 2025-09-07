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
exports.TraineeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const trainee_entity_1 = require("../entities/trainee.entity");
const user_entity_1 = require("../entities/user.entity");
const typeorm_2 = require("typeorm");
let TraineeService = class TraineeService {
    _traineeRepository;
    _userRepository;
    constructor(_traineeRepository, _userRepository) {
        this._traineeRepository = _traineeRepository;
        this._userRepository = _userRepository;
    }
    async create(payload) {
        try {
            const user = await this._userRepository.findOne({ where: { id: payload.userId } });
            if (!user) {
                return {
                    isSuccess: false,
                    statusCode: 404,
                    message: 'User không tồn tại'
                };
            }
            const exist = await this._traineeRepository.findOne({ where: { id: payload.userId } });
            if (exist) {
                return {
                    isSuccess: false,
                    statusCode: 400,
                    message: 'User đã có thông tin trainee'
                };
            }
            const trainee = this._traineeRepository.create({
                id: user.id,
                weight: payload.weight,
                height: payload.height,
                user: user,
            });
            await this._traineeRepository.save(trainee);
            return {
                isSuccess: true,
                statusCode: 201,
                message: 'Tạo thông tin trainee thành công',
                data: trainee
            };
        }
        catch (error) {
            return {
                isSuccess: false,
                statusCode: 500,
                message: 'Lỗi hệ thống'
            };
        }
    }
    async update(payload) {
        try {
            const trainee = await this._traineeRepository.findOne({ where: { id: payload.userId } });
            if (!trainee) {
                return {
                    isSuccess: false,
                    statusCode: 404,
                    message: 'Trainee không tồn tại'
                };
            }
            trainee.weight = payload.weight;
            trainee.height = payload.height;
            await this._traineeRepository.save(trainee);
            if (!trainee) {
                return {
                    isSuccess: false,
                    statusCode: 404,
                    message: 'Trainee không tồn tại'
                };
            }
            const user = await this._userRepository.findOne({ where: { id: payload.userId }, relations: ['trainee'] });
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Cập nhật thành công!',
                data: user
            };
        }
        catch (error) {
            return {
                isSuccess: false,
                statusCode: 500,
                message: 'Lỗi hệ thống, vui lòng thử lại sau'
            };
        }
    }
};
exports.TraineeService = TraineeService;
exports.TraineeService = TraineeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(trainee_entity_1.Trainee)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TraineeService);
//# sourceMappingURL=trainee.service.js.map