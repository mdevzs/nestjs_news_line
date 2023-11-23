import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseProfileDto } from './dtos/profile.dtos';

@Injectable()
export class ProfileService {
    constructor(private readonly prismaService: PrismaService) { }

    async profile(id: number) {
        const user = await this.prismaService.users.findUnique({
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
        return new ResponseProfileDto({ ...user, profileImage: user.profileImage != null ? `http://192.168.0.103:3000/profile/images/${user.profileImage}` : null, });
    }

}
