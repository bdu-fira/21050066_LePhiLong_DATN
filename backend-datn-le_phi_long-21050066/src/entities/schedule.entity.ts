import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Trainee } from './trainee.entity';
import { ScheduleDetail } from './scheduledetail.entity';

@Entity('schedule')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  traineeID: number;

  @Column()
  level: number;

  @Column()
  isTraining: number;

  @ManyToOne(() => Trainee, (trainee) => trainee.schedules)
  @JoinColumn({ name: 'traineeID', referencedColumnName: 'id' })
  trainee: Trainee;

  @OneToMany(() => ScheduleDetail, (detail) => detail.schedule)
  details: ScheduleDetail[];
}
