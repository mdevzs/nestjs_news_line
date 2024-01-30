import { Exclude } from "class-transformer"

export class ResponseDiscoverDto {
    news: {}
    accounts: {}
    tags: {}

    constructor(partial: Partial<ResponseDiscoverDto>) {
        Object.assign(this, partial)
    }
}

export class ResponseDiscoverTagsDto {
    postsCount: number
    @Exclude()
    _count: {}

    constructor(partial: Partial<ResponseDiscoverTagsDto>) {
        Object.assign(this, partial)
    }
}

export class ResponseGetDiscoverDto {
    topNews: {}
    popularPublishers: {}
    popularAuthors: {}
    recommandedNews: {}

    constructor(partial: Partial<ResponseGetDiscoverDto>) {
        Object.assign(this, partial)
    }
}