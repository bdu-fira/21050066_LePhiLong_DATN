import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
  } from 'typeorm';
  import { Trainee } from './trainee.entity';
  
  @Entity()
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'nvarchar', length: 255 })
    name: string;
  
    @Column({ type: 'int' })
    gender: number;
  
    @Column({ type: 'date' })
    dateOfBirth: Date;
  
    @Column({ type: 'int', default: 0 })
    isAdmin: number;
  
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;
  
    @Column({ type: 'varchar', length: 255 })
    password: string;
  
    @Column({ type: 'datetime', nullable: true })
    lastReset: Date;
  
    @OneToOne(() => Trainee, trainee => trainee.user, { cascade: true })
    trainee: Trainee;
  }
  