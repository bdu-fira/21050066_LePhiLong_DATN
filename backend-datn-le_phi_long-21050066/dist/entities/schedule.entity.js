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
exports.Schedule = void 0;
const typeorm_1 = require("typeorm");
const trainee_entity_1 = require("./trainee.entity");
const scheduledetail_entity_1 = require("./scheduledetail.entity");
let Schedule = class Schedule {
    id;
    traineeID;
    level;
    isTraining;
    trainee;
    details;
};
exports.Schedule = Schedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Schedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Schedule.prototype, "traineeID", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Schedule.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Schedule.prototype, "isTraining", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => trainee_entity_1.Trainee, (trainee) => trainee.schedules),
    (0, typeorm_1.JoinColumn)({ name: 'traineeID', referencedColumnName: 'id' }),
    __metadata("design:type", trainee_entity_1.Trainee)
], Schedule.prototype, "trainee", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => scheduledetail_entity_1.ScheduleDetail, (detail) => detail.schedule),
    __metadata("design:type", Array)
], Schedule.prototype, "details", void 0);
exports.Schedule = Schedule = __decorate([
    (0, typeorm_1.Entity)('schedule')
], Schedule);
//# sourceMappingURL=schedule.entity.js.map