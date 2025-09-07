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
exports.Position = void 0;
const typeorm_1 = require("typeorm");
const exercise_entity_1 = require("./exercise.entity");
const evaluationcriteria_entity_1 = require("./evaluationcriteria.entity");
let Position = class Position {
    id;
    exerciseID;
    name;
    order;
    exercise;
    evaluationCriteria;
};
exports.Position = Position;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Position.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Position.prototype, "exerciseID", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Position.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Position.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exercise_entity_1.Exercise, (exercise) => exercise.positions),
    (0, typeorm_1.JoinColumn)({ name: 'exerciseID', referencedColumnName: 'id' }),
    __metadata("design:type", exercise_entity_1.Exercise)
], Position.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => evaluationcriteria_entity_1.EvaluationCriteria, (criteria) => criteria.position),
    __metadata("design:type", Array)
], Position.prototype, "evaluationCriteria", void 0);
exports.Position = Position = __decorate([
    (0, typeorm_1.Entity)('position')
], Position);
//# sourceMappingURL=position.entity.js.map