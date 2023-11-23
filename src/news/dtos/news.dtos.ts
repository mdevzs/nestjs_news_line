import { Exclude } from "class-transformer"
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { UserResponseDto } from "src/user/auth/dtos/auth.dto"
import { ResponseCommnetNewsDto } from "../comments/dtos/comments.dtos"

export class CreateNewsDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsString()
    @IsNotEmpty()
    readTime: string

    @IsString()
    @IsNotEmpty()
    description: string

    @IsArray()
    tags: Array<string>
}

export class AddTrendingNewsDto {
    @IsBoolean()
    isTrending: boolean
}

export class UpdatedNewsDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    readTime: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    viewsCount: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description: string

    @IsOptional()
    @IsArray()
    tags: Array<string>
}

export class RecentNewsDto {
    @IsString()
    tag: string
}

export class ResponseRecentTrendingNewsDto {
    coverImage: string
    createdAt: string
    creator: { id: number, profileImage?: string, fullName?: string }
    commentCounts: number
    tagNews: {}

    @Exclude()
    _count: { comments: number }

    constructor(partial: Partial<ResponseRecentTrendingNewsDto>) {
        Object.assign(this, partial)
    }
}

export class ResponseNewsByIdDto {
    coverImage: string
    creator: UserResponseDto
    comments: {}
    userNews: {}[]
    createdAt: string

    constructor(partial: Partial<ResponseNewsByIdDto>) {
        Object.assign(this, partial)
    }
}