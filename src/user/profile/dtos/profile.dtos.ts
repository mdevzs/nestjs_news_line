import { Exclude } from "class-transformer";

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