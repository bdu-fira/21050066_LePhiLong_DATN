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
exports.ExerciseLevel = void 0;
const typeorm_1 = require("typeorm");
const exercise_entity_1 = require("./exercise.entity");
let ExerciseLevel = class ExerciseLevel {
    exerciseID;
    level;
    set;
    rep;
    exercise;
};
exports.ExerciseLevel = ExerciseLevel;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], ExerciseLevel.prototype, "exerciseID", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], ExerciseLevel.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ExerciseLevel.prototype, "set", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ExerciseLevel.prototype, "rep", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => exercise_entity_1.Exercise),
    (0, typeorm_1.JoinColumn)({ name: 'exerciseID', referencedColumnName: 'id' }),
    __metadata("design:type", exercise_entity_1.Exercise)
], ExerciseLevel.prototype, "exercise", void 0);
exports.ExerciseLevel = ExerciseLevel = __decorate([
    (0, typeorm_1.Entity)('exerciselevel')
], ExerciseLevel);
//# sourceMappingURL=exerciselevel.entity.js.map