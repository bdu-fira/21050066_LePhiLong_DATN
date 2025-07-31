import { forwardRef, Module } from '@nestjs/common';
import { TraineeController } from './trainee.controller';
import { TraineeService } from './trainee.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainee } from 'src/entities/trainee.entity';
import { User } from 'src/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Trainee]),
    forwardRef(() => UserModule), // <-- Sửa ở đây!
  ],
  controllers: [TraineeController],
  providers: [TraineeService],
  exports: [TraineeService],
})
export class TraineeModule {}
