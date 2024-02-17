import { Exclude } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class ResponseProfileDto {
    profileImage: string
    storiesCount: number
    followersCount: number
    followingCount: number
    isFollowing: boolean
    userNews: {}
    @Exclude()
    password: string
    @Exclude()
    _count: {}
    @Exclude()
    news: {}

    constructor(partial: Partial<ResponseProfileDto>) {
        Object.assign(this, partial)
    }
}

export class EditProfileDto {
    @IsString()
    @IsOptional()
    fullName: string

    @IsString()
    @IsOptional()
    username: string

    @IsString()
    @IsOptional()
    bio: string

    @IsString()
    @IsOptional()
    website: string
}