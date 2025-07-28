import { Transform } from "class-transformer";
import { format } from "date-fns";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    gender: number;

    @Column({ type: 'date' })
    @Transform(({ value }) => value ? format(new Date(value), 'yyyy-MM-dd') : null)
    dateOfBirth: Date;

    @Column({type: "tinyint"})
    isAdmin: number;

    @Column()
    email: string;
    
    @Column()
    password: string;
}
