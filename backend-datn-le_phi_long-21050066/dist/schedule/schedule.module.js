"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_entity_1 = require("../entities/schedule.entity");
const scheduledetail_entity_1 = require("../entities/scheduledetail.entity");
const exercise_entity_1 = require("../entities/exercise.entity");
const muscle_entity_1 = require("../entities/muscle.entity");
const evaluationcriteria_entity_1 = require("../entities/evaluationcriteria.entity");
const trainee_entity_1 = require("../entities/trainee.entity");
const schedule_service_1 = require("./schedule.service");
const schedule_controller_1 = require("./schedule.controller");
const user_module_1 = require("../user/user.module");
const exerciselevel_entity_1 = require("../entities/exerciselevel.entity");
const result_entity_1 = require("../entities/result.entity");
let ScheduleModule = class ScheduleModule {
};
exports.ScheduleModule = ScheduleModule;
exports.ScheduleModule = ScheduleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([schedule_entity_1.Schedule, scheduledetail_entity_1.ScheduleDetail, exercise_entity_1.Exercise, muscle_entity_1.Muscle, evaluationcriteria_entity_1.EvaluationCriteria, trainee_entity_1.Trainee, exerciselevel_entity_1.ExerciseLevel, result_entity_1.Result]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
        ],
        providers: [schedule_service_1.ScheduleService],
        controllers: [schedule_controller_1.ScheduleController],
        exports: [schedule_service_1.ScheduleService],
    })
], ScheduleModule);
//# sourceMappingURL=schedule.module.js.map