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
exports.Exercise = void 0;
const typeorm_1 = require("typeorm");
const exerciselevel_entity_1 = require("./exerciselevel.entity");
const muscle_entity_1 = require("./muscle.entity");
const position_entity_1 = require("./position.entity");
const scheduledetail_entity_1 = require("./scheduledetail.entity");
let Exercise = class Exercise {
    id;
    name;
    minAge;
    maxAge;
    calo;
    lastTrainResult;
    path;
    levels;
    muscles;
    positions;
    scheduleDetails;
};
exports.Exercise = Exercise;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Exercise.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Exercise.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Exercise.prototype, "minAge", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Exercise.prototype, "maxAge", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'double' }),
    __metadata("design:type", Number)
], Exercise.prototype, "calo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'double', nullable: true }),
    __metadata("design:type", Number)
], Exercise.prototype, "lastTrainResult", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Exercise.prototype, "path", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => exerciselevel_entity_1.ExerciseLevel, (level) => level.exercise),
    __metadata("design:type", Array)
], Exercise.prototype, "levels", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => muscle_entity_1.Muscle, (muscle) => muscle.exercise),
    __metadata("design:type", Array)
], Exercise.prototype, "muscles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => position_entity_1.Position, (position) => position.exercise),
    __metadata("design:type", Array)
], Exercise.prototype, "positions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => scheduledetail_entity_1.ScheduleDetail, (detail) => detail.exercise),
    __metadata("design:type", Array)
], Exercise.prototype, "scheduleDetails", void 0);
exports.Exercise = Exercise = __decorate([
    (0, typeorm_1.Entity)('exercise')
], Exercise);
//# sourceMappingURL=exercise.entity.js.map