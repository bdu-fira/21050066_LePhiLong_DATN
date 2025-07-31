import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDTO{
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}