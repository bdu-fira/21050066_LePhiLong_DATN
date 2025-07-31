import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    PrimaryColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity()
  export class Trainee {
    @PrimaryColumn()
    id: number;
  
    @Column({ type: 'int', nullable: true })
    weight: number;
  
    @Column({ type: 'int', nullable: true })
    height: number;
  
    @OneToOne(() => User, user => user.trainee)
    @JoinColumn({ name: 'id', referencedColumnName: 'id' }) // id là PK+FK
    user: User;
  }
  