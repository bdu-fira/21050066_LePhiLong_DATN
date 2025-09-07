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
exports.ExerciseController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const exercise_service_1 = require("./exercise.service");
const platform_express_1 = require("@nestjs/platform-express");
const fs_1 = require("fs");
let ExerciseController = class ExerciseController {
    exerciseService;
    constructor(exerciseService) {
        this.exerciseService = exerciseService;
    }
    async create(payload, req, res) {
        const result = await this.exerciseService.create({ ...payload, userId: req.userID, userRole: req.userRole });
        res.status(result.statusCode).json(result);
    }
    async find(query, res) {
        const result = await this.exerciseService.findAll(query);
        res.status(result.statusCode).json(result);
    }
    async findOne(query, res) {
        const result = await this.exerciseService.findOne(query);
        res.status(result.statusCode).json(result);
    }
    async delete(payload, res) {
        const result = await this.exerciseService.delete(payload);
        res.status(result.statusCode).json(result);
    }
    async updateInfo(payload, req, res, file) {
        const result = await this.exerciseService.updateInfo({ ...payload, userId: req.userID, userRole: req.userRole, file });
        res.status(result.statusCode).json(result);
    }
    async updateLevel(payload, req, res) {
        const result = await this.exerciseService.updateLevel({ ...payload, userId: req.userID, userRole: req.userRole });
        res.status(result.statusCode).json(result);
    }
    async updateCriteria(payload, req, res) {
        const result = await this.exerciseService.updateCriteria({ ...payload, userId: req.userID });
        res.status(result.statusCode).json(result);
    }
    async updateModel(payload, res, files) {
        const result = await this.exerciseService.updateModel({ ...payload, files, modelJson: files[0], modelWeights: files[1] });
        res.status(result.statusCode).json(result);
    }
    async getExercise(payload, req, res) {
        const result = await this.exerciseService.getExercise({ ...payload, userId: req.userID, userRole: req.userRole });
        res.status(result.statusCode).json(result);
    }
    async getFile(query) {
        const file = (0, fs_1.createReadStream)(query.path);
        return new common_1.StreamableFile(file);
    }
    async getExamples(res) {
        const result = await this.exerciseService.getExamples();
        res.status(result.statusCode).json(result);
    }
    async saveStats(payload, req, res) {
        const result = await this.exerciseService.saveStats({ date: payload.date, errors: payload.errors, userID: req.userID });
        res.status(result.statusCode).json(result);
    }
};
exports.ExerciseController = ExerciseController;
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Get)('findAll'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "find", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Get)('findOne'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0])),
    (0, common_1.Delete)('delete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "delete", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, common_1.Patch)('updateInfo'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "updateInfo", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Patch)('updateLevel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "updateLevel", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Patch)('updateCriteria'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "updateCriteria", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    (0, common_1.Patch)('updateModel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Array]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "updateModel", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Post)('getExercise'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "getExercise", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Get)('getFile'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "getFile", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Get)('getExamples'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "getExamples", null);
__decorate([
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)([0, 1])),
    (0, common_1.Post)('saveStats'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "saveStats", null);
exports.ExerciseController = ExerciseController = __decorate([
    (0, common_1.Controller)('exercise'),
    __metadata("design:paramtypes", [exercise_service_1.ExerciseService])
], ExerciseController);
//# sourceMappingURL=exercise.controller.js.map