import { Exclude } from "class-transformer"
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator"


export class CommnetNewsDto {
    @IsString()
    @IsNotEmpty()
    comment: string

    @IsOptional()
    @IsInt()
    parentId: number
}

export class ResponseCommnetNewsDto {
    likeCounts: number
    createdAt: string    

    constructor(partial: Partial<ResponseCommnetNewsDto>) {
        Object.assign(this, partial)
    }
}