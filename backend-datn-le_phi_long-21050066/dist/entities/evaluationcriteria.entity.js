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
exports.EvaluationCriteria = void 0;
const typeorm_1 = require("typeorm");
const position_entity_1 = require("./position.entity");
const joint_entity_1 = require("./joint.entity");
let EvaluationCriteria = class EvaluationCriteria {
    id;
    positionID;
    operator;
    angle;
    errorMessage;
    position;
    joints;
};
exports.EvaluationCriteria = EvaluationCriteria;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EvaluationCriteria.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EvaluationCriteria.prototype, "positionID", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'varchar' }),
    __metadata("design:type", String)
], EvaluationCriteria.prototype, "operator", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'int' }),
    __metadata("design:type", Object)
], EvaluationCriteria.prototype, "angle", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true, type: 'varchar' }),
    __metadata("design:type", Object)
], EvaluationCriteria.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => position_entity_1.Position, (position) => position.evaluationCriteria),
    (0, typeorm_1.JoinColumn)({ name: 'positionID', referencedColumnName: 'id' }),
    __metadata("design:type", position_entity_1.Position)
], EvaluationCriteria.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => joint_entity_1.Joint, (joint) => joint.evaluationCriteria),
    __metadata("design:type", Array)
], EvaluationCriteria.prototype, "joints", void 0);
exports.EvaluationCriteria = EvaluationCriteria = __decorate([
    (0, typeorm_1.Entity)('evaluationcriteria')
], EvaluationCriteria);
//# sourceMappingURL=evaluationcriteria.entity.js.map