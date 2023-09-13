import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLE_KEY } from "../decorators/roles.decorators";
import { PrismaService } from "src/prisma/prisma.service";

export interface UserInfo {
    id: number,
    name: string
}

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private reflectore: Reflector, private readonly prismaService: PrismaService) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const user = request.user as UserInfo

        const requiredRorls = this.reflectore.getAllAndOverride(ROLE_KEY, [
            context.getClass(),
            context.getHandler()
        ])

        return await this.validateRole(user, requiredRorls)

    }

    private async validateRole({ id }: UserInfo, reqRoles: string[]) {
        let result = false
        const user = await this.prismaService.users.findUnique(
            {
                where: {
                    id
                }
            }
        )
        if (!user) {
            result = false
        }
        reqRoles.map(role => { result = role === user.userType })

        return result;
    }

}
