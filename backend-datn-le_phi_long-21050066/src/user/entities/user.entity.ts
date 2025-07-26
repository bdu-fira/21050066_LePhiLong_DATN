import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    gender: number;

    @Column()
    dateOfBirth: Date;

    @Column({type: "tinyint"})
    isAdmin: number;

    @Column()
    email: string;
    
    @Column()
    password: string;
}
