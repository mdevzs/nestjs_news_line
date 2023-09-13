import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const token = request.headers.authorization?.split('Bearer ')[1]

        if (!token) {
            throw new UnauthorizedException()
        }

        try {
            request.user = await this.jwtService.verifyAsync(token)
        } catch (error) {
            console.log(error)
            throw new UnauthorizedException()
        }

        return true;
    }
}    
