import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('admin')
export class Admin {
  @PrimaryColumn()
  id: number; // PK, đồng thời FK sang user.id

  @Column({ nullable: true, length: 255 })
  lastLoginIP: string;

  @OneToOne(() => User, (user) => user.admin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  user: User;
}
