import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Result } from './result.entity';

@Entity('jointlist')
export class JointList {
  @PrimaryColumn()
  id: number;

  @PrimaryColumn()
  resultID: number;

  @Column()
  order: number;

  @ManyToOne(() => Result, (result) => result.jointLists)
  @JoinColumn({ name: 'resultID', referencedColumnName: 'id' })
  result: Result;
}
