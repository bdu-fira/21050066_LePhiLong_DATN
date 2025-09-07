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
exports.ScheduleDetail = void 0;
const typeorm_1 = require("typeorm");
const schedule_entity_1 = require("./schedule.entity");
const exercise_entity_1 = require("./exercise.entity");
const result_entity_1 = require("./result.entity");
let ScheduleDetail = class ScheduleDetail {
    id;
    scheduleID;
    exerciseID;
    set;
    rep;
    isTrained;
    date;
    schedule;
    exercise;
    results;
};
exports.ScheduleDetail = ScheduleDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ScheduleDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ScheduleDetail.prototype, "scheduleID", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ScheduleDetail.prototype, "exerciseID", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ScheduleDetail.prototype, "set", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ScheduleDetail.prototype, "rep", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ScheduleDetail.prototype, "isTrained", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], ScheduleDetail.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => schedule_entity_1.Schedule, (schedule) => schedule.details),
    (0, typeorm_1.JoinColumn)({ name: 'scheduleID', referencedColumnName: 'id' }),
    __metadata("design:type", schedule_entity_1.Schedule)
], ScheduleDetail.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exercise_entity_1.Exercise, (exercise) => exercise.scheduleDetails),
    (0, typeorm_1.JoinColumn)({ name: 'exerciseID', referencedColumnName: 'id' }),
    __metadata("design:type", exercise_entity_1.Exercise)
], ScheduleDetail.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => result_entity_1.Result, (result) => result.scheduleDetail),
    __metadata("design:type", Array)
], ScheduleDetail.prototype, "results", void 0);
exports.ScheduleDetail = ScheduleDetail = __decorate([
    (0, typeorm_1.Entity)('scheduledetail')
], ScheduleDetail);
//# sourceMappingURL=scheduledetail.entity.js.map