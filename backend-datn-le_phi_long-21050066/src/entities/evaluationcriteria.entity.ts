import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Position } from './position.entity';
import { Joint } from './joint.entity';

@Entity('evaluationcriteria')
export class EvaluationCriteria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  positionID: number;

  @Column({ nullable: false, type:'varchar' })
  operator: string;

  @Column({ nullable: false, type:'int' })
  angle: number | null;

  @Column({ length: 255, nullable: true, type:'varchar' })
  errorMessage: string | null;

  @ManyToOne(() => Position, (position) => position.evaluationCriteria)
  @JoinColumn({ name: 'positionID', referencedColumnName: 'id' })
  position: Position;

  @OneToMany(() => Joint, (joint) => joint.evaluationCriteria)
  joints: Joint[];
}
