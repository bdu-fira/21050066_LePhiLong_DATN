import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Exercise } from './exercise.entity';
import { EvaluationCriteria } from './evaluationcriteria.entity';

@Entity('position')
export class Position {
  @PrimaryGeneratedColumn()
  id: number; // AUTO_INCREMENT, là một phần của PK phức hợp

  @Column()
  exerciseID: number;

  @Column({ length: 255, nullable: true })
  name: string;

  @ManyToOne(() => Exercise, (exercise) => exercise.positions)
  @JoinColumn({ name: 'exerciseID', referencedColumnName: 'id' })
  exercise: Exercise;

  @OneToMany(() => EvaluationCriteria, (criteria) => criteria.position)
  evaluationCriteria: EvaluationCriteria[];
}
