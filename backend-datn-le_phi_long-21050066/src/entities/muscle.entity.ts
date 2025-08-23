import { Entity, PrimaryGeneratedColumn, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Exercise } from './exercise.entity';

@Entity('muscle')
export class Muscle {
  @PrimaryColumn()
  id: number; 

  @PrimaryColumn()
  exerciseID: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.muscles)
  @JoinColumn({ name: 'exerciseID', referencedColumnName: 'id' })
  exercise: Exercise;
}
