import { UserType } from "@prisma/client"
import { Exclude } from "class-transformer"
import { IsArray, IsEmail, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MinLength } from "class-validator"


export class SignupDto {
    @IsString()
    @IsNotEmpty()
    fullName: string

    @IsString()
    @IsNotEmpty()
    username: string

    @Matches('^[0][9][0-9][0-9]{8,8}$', '', { message: 'phone must be a valid phone' })
    phone: string

    @IsEmail()
    email: string

    @IsString()
    @MinLength(5)
    password: string

    @IsString()
    @IsNotEmpty()
    gender: string

    @IsString()
    @IsNotEmpty()
    country: string

    @IsString()
    @IsNotEmpty()
    dateOfBirth: string

    @IsString()
    @IsOptional()
    bio: string

    @IsOptional()
    @IsArray()
    following: Array<string>

    @IsOptional()
    @IsArray()
    intrestedTags: Array<string>

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    officialKey?: string
}

export class UserResponseDto {
    fullName: string
    username: string
    phone: string
    email: string
    gender: string
    country: string
    dateOfBirth: string
    bio: string
    profileImage?: string
    followersCount?: number
    token?: string
    @Exclude()
    password: string
    @Exclude()
    _count: {}

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial)
    }
}

export class GrOfficialKeyDto {
    @IsEmail()
    email: string

    @IsEnum(UserType)
    userType: UserType
}

export class SigninDto {
    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string
}