
export class ResponseHomeDto {
    user: {}
    trendingNews: {}
    tags:{}
    //recentNews: {}
    constructor(partial: Partial<ResponseHomeDto>) {
        Object.assign(this, partial)
    }
}

export class ResponseTagDto{
    image:string

    constructor(partial: Partial<ResponseTagDto>) {
        Object.assign(this, partial)
    }
}