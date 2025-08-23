import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ExerciseLevel } from './exerciselevel.entity';
import { Muscle } from './muscle.entity';
import { Position } from './position.entity';
import { ScheduleDetail } from './scheduledetail.entity';

@Entity('exercise')
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column()
  minAge: number;

  @Column()
  maxAge: number;

  @Column({ type:'double' })
  calo: number;

  @Column({ type: 'double', nullable: true})
  lastTrainResult: number;

  @Column({ length: 255, nullable: true })
  path: string;

  @OneToMany(() => ExerciseLevel, (level) => level.exercise)
  levels: ExerciseLevel[];

  @OneToMany(() => Muscle, (muscle) => muscle.exercise)
  muscles: Muscle[];

  @OneToMany(() => Position, (position) => position.exercise)
  positions: Position[];

  @OneToMany(() => ScheduleDetail, (detail) => detail.exercise)
  scheduleDetails: ScheduleDetail[];
}
