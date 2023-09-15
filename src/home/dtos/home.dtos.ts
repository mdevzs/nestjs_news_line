
export class ResponseHomeDto {
    user: {}
    trendingNews: {}
    tags:{}
    recentNews: {}
    constructor(partial: Partial<ResponseHomeDto>) {
        Object.assign(this, partial)
    }
}