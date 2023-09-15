
export class ResponseDiscoverDto{
    news:{}
    accounts:{}

    constructor(partial: Partial<ResponseDiscoverDto>) {
        Object.assign(this, partial)
    }
}