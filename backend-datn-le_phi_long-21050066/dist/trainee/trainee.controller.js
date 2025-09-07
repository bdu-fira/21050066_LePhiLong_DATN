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
exports.TraineeController = void 0;
const common_1 = require("@nestjs/common");
const trainee_service_1 = require("./trainee.service");
const auth_guard_1 = require("../auth/auth.guard");
let TraineeController = class TraineeController {
    traineeService;
    constructor(traineeService) {
        this.traineeService = traineeService;
    }
    async create(payload, req, res) {
        const result = await this.traineeService.create({ ...payload, userId: req.userID });
        res.status(result.statusCode).json(result);
    }
    async update(payload, req, res) {
        const result = await this.traineeService.update({ ...payload, userId: req.userID });
        res.status(result.statusCode).json(result);
    }
};
exports.TraineeController = TraineeController;
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0])),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TraineeController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0])),
    (0, common_1.Patch)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TraineeController.prototype, "update", null);
exports.TraineeController = TraineeController = __decorate([
    (0, common_1.Controller)('trainee'),
    __metadata("design:paramtypes", [trainee_service_1.TraineeService])
], TraineeController);
//# sourceMappingURL=trainee.controller.js.map