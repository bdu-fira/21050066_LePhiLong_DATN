import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Schedule } from './schedule.entity';

@Entity('trainee')
export class Trainee {
  @PrimaryColumn()
  id: number; // PK, đồng thời FK sang user.id

  @Column({ default: 0 })
  weight: number;

  @Column({ default: 0 })
  height: number;

  @OneToOne(() => User, (user) => user.trainee, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  user: User;

  @OneToMany(() => Schedule, (schedule) => schedule.trainee)
  schedules: Schedule[];
}
