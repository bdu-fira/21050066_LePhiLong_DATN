import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Admin } from './admin.entity';
import { Trainee } from './trainee.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column()
  gender: number;

  @Column({ type: 'date' })
  dateOfBirth: string; // DATE

  @Column({ default: 0 })
  isAdmin: number;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'datetime', nullable: true })
  lastReset: Date | null;

  @OneToOne(() => Admin, (admin) => admin.user)
  admin: Admin;

  @OneToOne(() => Trainee, (trainee) => trainee.user)
  trainee: Trainee;
}
