import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from 'src/entities/exercise.entity';
import { Muscle } from 'src/entities/muscle.entity';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { UserModule } from 'src/user/user.module';
import { ExerciseLevel } from 'src/entities/exerciselevel.entity';
import { EvaluationCriteria } from 'src/entities/evaluationcriteria.entity';
import { Position } from 'src/entities/position.entity';
import { Joint } from 'src/entities/joint.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { ScheduleDetail } from 'src/entities/scheduledetail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exercise, Muscle, ExerciseLevel, EvaluationCriteria, Position, Joint, Schedule, ScheduleDetail]),
    forwardRef(() => UserModule),
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService],
  exports: [ExerciseService],
})
export class ExerciseModule {}
