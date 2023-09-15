import { Exclude } from "class-transformer";

export class ResponseProfileDto{
    @Exclude()
    password:string

    constructor(partial: Partial<ResponseProfileDto>) {
        Object.assign(this, partial)
    }
}