import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Schedule } from './schedule.entity';
import { Exercise } from './exercise.entity';
import { Result } from './result.entity';

@Entity('scheduledetail')
export class ScheduleDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  scheduleID: number;

  @Column()
  exerciseID: number;

  @Column()
  set: number;

  @Column()
  rep: number;

  @Column({ default: 0 })
  isTrained: number;

  @Column({ type: 'date' })
  date: string; // DATE

  @ManyToOne(() => Schedule, (schedule) => schedule.details)
  @JoinColumn({ name: 'scheduleID', referencedColumnName: 'id' })
  schedule: Schedule;

  @ManyToOne(() => Exercise, (exercise) => exercise.scheduleDetails)
  @JoinColumn({ name: 'exerciseID', referencedColumnName: 'id' })
  exercise: Exercise;

  @OneToMany(() => Result, (result) => result.scheduleDetail)
  results: Result[];
}
