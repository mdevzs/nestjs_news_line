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
    likeCounts?: number
    createdAt: string
    isLiked: boolean
    creator: { id: number, fullName: string, profileImage: string }
    replies: {}
    @Exclude()
    commentLikes: {}
    @Exclude()
    comments: {}

    constructor(partial: Partial<ResponseCommnetNewsDto>) {
        Object.assign(this, partial)
    }
}

export class ResponseGetAllCommentsDto {
    top: {}
    newest: {}

    constructor(partial: Partial<ResponseGetAllCommentsDto>) {
        Object.assign(this, partial)
    }
}