import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Trainee } from 'src/entities/trainee.entity';
import { TraineeModule } from 'src/trainee/trainee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Trainee]),
    forwardRef(() => TraineeModule),

  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {
}
