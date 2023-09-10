import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
    constructor(private readonly prismaService: PrismaService) { }

    async profile(id: number) {
        const user = this.prismaService.users.findUnique({
            where: {
                id
            },
            include: {
                intrestedTags: {
                    include: {
                        tag: true
                    }
                },
                following: {
                    include: { following: true }
                },
                followers: {
                    include: { follower: true }
                },
            }
        })
        return user;
    }

}
