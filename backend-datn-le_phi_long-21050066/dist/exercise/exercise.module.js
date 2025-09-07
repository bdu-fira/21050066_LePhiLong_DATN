"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const exercise_entity_1 = require("../entities/exercise.entity");
const muscle_entity_1 = require("../entities/muscle.entity");
const exercise_controller_1 = require("./exercise.controller");
const exercise_service_1 = require("./exercise.service");
const user_module_1 = require("../user/user.module");
const exerciselevel_entity_1 = require("../entities/exerciselevel.entity");
const evaluationcriteria_entity_1 = require("../entities/evaluationcriteria.entity");
const position_entity_1 = require("../entities/position.entity");
const joint_entity_1 = require("../entities/joint.entity");
const schedule_entity_1 = require("../entities/schedule.entity");
const scheduledetail_entity_1 = require("../entities/scheduledetail.entity");
const result_entity_1 = require("../entities/result.entity");
let ExerciseModule = class ExerciseModule {
};
exports.ExerciseModule = ExerciseModule;
exports.ExerciseModule = ExerciseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([exercise_entity_1.Exercise, muscle_entity_1.Muscle, exerciselevel_entity_1.ExerciseLevel, evaluationcriteria_entity_1.EvaluationCriteria, position_entity_1.Position, joint_entity_1.Joint, schedule_entity_1.Schedule, scheduledetail_entity_1.ScheduleDetail, result_entity_1.Result]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
        ],
        controllers: [exercise_controller_1.ExerciseController],
        providers: [exercise_service_1.ExerciseService],
        exports: [exercise_service_1.ExerciseService],
    })
], ExerciseModule);
//# sourceMappingURL=exercise.module.js.map