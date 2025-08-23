import { forwardRef, Module } from '@nestjs/common';
import { TraineeController } from './trainee.controller';
import { TraineeService } from './trainee.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainee } from 'src/entities/trainee.entity';
import { User } from 'src/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { Schedule } from 'src/entities/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Trainee, Schedule]),
    forwardRef(() => UserModule), 
  ],
  controllers: [TraineeController],
  providers: [TraineeService],
  exports: [TraineeService],
})
export class TraineeModule {}
