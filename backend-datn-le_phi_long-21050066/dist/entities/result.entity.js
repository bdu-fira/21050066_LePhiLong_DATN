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
exports.Result = void 0;
const typeorm_1 = require("typeorm");
const scheduledetail_entity_1 = require("./scheduledetail.entity");
const jointList_entity_1 = require("./jointList.entity");
let Result = class Result {
    id;
    scheduleDetailID;
    set;
    rep;
    positionName;
    actualAngle;
    errorMessage;
    scheduleDetail;
    jointLists;
};
exports.Result = Result;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Result.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Result.prototype, "scheduleDetailID", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Result.prototype, "set", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Result.prototype, "rep", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Result.prototype, "positionName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Result.prototype, "actualAngle", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Result.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => scheduledetail_entity_1.ScheduleDetail, (detail) => detail.results),
    (0, typeorm_1.JoinColumn)({ name: 'scheduleDetailID', referencedColumnName: 'id' }),
    __metadata("design:type", scheduledetail_entity_1.ScheduleDetail)
], Result.prototype, "scheduleDetail", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => jointList_entity_1.JointList, (jl) => jl.result),
    __metadata("design:type", Array)
], Result.prototype, "jointLists", void 0);
exports.Result = Result = __decorate([
    (0, typeorm_1.Entity)('result')
], Result);
//# sourceMappingURL=result.entity.js.map