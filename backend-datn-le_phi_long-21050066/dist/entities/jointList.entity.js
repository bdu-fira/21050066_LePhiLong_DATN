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
exports.JointList = void 0;
const typeorm_1 = require("typeorm");
const result_entity_1 = require("./result.entity");
let JointList = class JointList {
    id;
    resultID;
    order;
    result;
};
exports.JointList = JointList;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], JointList.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], JointList.prototype, "resultID", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], JointList.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => result_entity_1.Result, (result) => result.jointLists),
    (0, typeorm_1.JoinColumn)({ name: 'resultID', referencedColumnName: 'id' }),
    __metadata("design:type", result_entity_1.Result)
], JointList.prototype, "result", void 0);
exports.JointList = JointList = __decorate([
    (0, typeorm_1.Entity)('jointlist')
], JointList);
//# sourceMappingURL=jointList.entity.js.map