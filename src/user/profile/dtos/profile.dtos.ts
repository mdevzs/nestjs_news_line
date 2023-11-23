import { Exclude } from "class-transformer";

export class ResponseProfileDto{
    @Exclude()
    password:string
    profileImage:string

    constructor(partial: Partial<ResponseProfileDto>) {
        Object.assign(this, partial)
    }
}