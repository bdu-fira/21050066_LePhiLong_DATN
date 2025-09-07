"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraineeModule = void 0;
const common_1 = require("@nestjs/common");
const trainee_controller_1 = require("./trainee.controller");
const trainee_service_1 = require("./trainee.service");
const typeorm_1 = require("@nestjs/typeorm");
const trainee_entity_1 = require("../entities/trainee.entity");
const user_entity_1 = require("../entities/user.entity");
const user_module_1 = require("../user/user.module");
const schedule_entity_1 = require("../entities/schedule.entity");
let TraineeModule = class TraineeModule {
};
exports.TraineeModule = TraineeModule;
exports.TraineeModule = TraineeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, trainee_entity_1.Trainee, schedule_entity_1.Schedule]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
        ],
        controllers: [trainee_controller_1.TraineeController],
        providers: [trainee_service_1.TraineeService],
        exports: [trainee_service_1.TraineeService],
    })
], TraineeModule);
//# sourceMappingURL=trainee.module.js.map