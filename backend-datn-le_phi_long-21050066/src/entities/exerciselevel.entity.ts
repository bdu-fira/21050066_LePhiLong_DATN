import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Exercise } from './exercise.entity';

@Entity('exerciselevel')
export class ExerciseLevel {
  @PrimaryColumn()
  exerciseID: number; 

  @PrimaryColumn()
  level: number;

  @Column()
  set: number;

  @Column()
  rep: number;

  @OneToOne(() => Exercise)
  @JoinColumn({ name: 'exerciseID', referencedColumnName: 'id' })
  exercise: Exercise;
}
