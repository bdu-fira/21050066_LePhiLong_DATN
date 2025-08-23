import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ScheduleDetail } from './scheduledetail.entity';
import { JointList } from './jointList.entity';

@Entity('result')
export class Result {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  scheduleDetailID: number;

  @Column()
  attempt: number;

  @Column()
  set: number;

  @Column()
  rep: number;

  @Column({ length: 255 })
  positionName: string;

  @Column()
  actualAngle: number;

  @Column({ length: 255 })
  errorMessage: string;

  @ManyToOne(() => ScheduleDetail, (detail) => detail.results)
  @JoinColumn({ name: 'scheduleDetailID', referencedColumnName: 'id' })
  scheduleDetail: ScheduleDetail;

  @OneToMany(() => JointList, (jl) => jl.result)
  jointLists: JointList[];
}
