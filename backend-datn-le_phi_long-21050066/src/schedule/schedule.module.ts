import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from 'src/entities/schedule.entity';
import { ScheduleDetail } from 'src/entities/scheduledetail.entity';
import { Exercise } from 'src/entities/exercise.entity';
import { Muscle } from 'src/entities/muscle.entity';
import { EvaluationCriteria } from 'src/entities/evaluationcriteria.entity';
import { Trainee } from 'src/entities/trainee.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { UserModule } from 'src/user/user.module';
import { ExerciseLevel } from 'src/entities/exerciselevel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, ScheduleDetail, Exercise, Muscle, EvaluationCriteria, Trainee, ExerciseLevel]),
    forwardRef(() => UserModule), 
  ],
  providers: [ScheduleService],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleModule {}