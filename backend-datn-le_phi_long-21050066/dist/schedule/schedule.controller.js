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
exports.ScheduleController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const schedule_service_1 = require("./schedule.service");
let ScheduleController = class ScheduleController {
    scheduleService;
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }
    async getSchedule(req, res) {
        const result = await this.scheduleService.getSchedule({
            userId: req.userID,
            userRole: req.userRole,
        });
        res.status(result.statusCode).json(result);
    }
    async createWeeklySchedule(req, res, payload) {
        const result = await this.scheduleService.createWeeklySchedule({ userId: req.userID, body: payload });
        res.status(result.statusCode).json(result);
    }
    async updateWeeklySchedule(req, res, payload) {
        const result = await this.scheduleService.updateWeeklySchedule({
            ...payload,
            userId: req.userID,
            userRole: req.userRole,
        });
        res.status(result.statusCode).json(result);
    }
    async deleteSchedule(req, res) {
        const result = await this.scheduleService.deleteSchedule({
            userId: req.userID,
            userRole: req.userRole,
        });
        res.status(result.statusCode).json(result);
    }
    async getStats(req, res) {
        const result = await this.scheduleService.getStats({ userId: req.userID });
        res.status(result.statusCode).json(result);
    }
    async getAnalytics(req, res) {
        const result = await this.scheduleService.getAnalytics({ userId: req.userID });
        res.status(result.statusCode).json(result);
    }
    async getAllStats(res) {
        const result = await this.scheduleService.getAllStats();
        res.status(result.statusCode).json(result);
    }
};
exports.ScheduleController = ScheduleController;
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Get)('getSchedule'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "createWeeklySchedule", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Patch)('update'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "updateWeeklySchedule", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Delete)('delete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "deleteSchedule", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Get)('getStats'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getStats", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Get)('getAnalytics'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([1])),
    (0, common_1.Get)('getAllStats'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getAllStats", null);
exports.ScheduleController = ScheduleController = __decorate([
    (0, common_1.Controller)('schedule'),
    __metadata("design:paramtypes", [schedule_service_1.ScheduleService])
], ScheduleController);
//# sourceMappingURL=schedule.controller.js.map