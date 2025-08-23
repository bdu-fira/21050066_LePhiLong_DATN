import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EvaluationCriteria } from './evaluationcriteria.entity';

@Entity('joint')
export class Joint {
  @PrimaryColumn()
  id: number;

  @PrimaryColumn()
  evaluationCriteriaID: number;

  @ManyToOne(() => EvaluationCriteria, (ec) => ec.joints)
  @JoinColumn({ name: 'evaluationCriteriaID', referencedColumnName: 'id' })
  evaluationCriteria: EvaluationCriteria;
}
