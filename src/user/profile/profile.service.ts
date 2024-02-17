import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditProfileDto, ResponseProfileDto } from './dtos/profile.dtos';
import { ResponseRecentTrendingNewsDto } from 'src/news/dtos/news.dtos';
import { formatDistance } from 'date-fns';
import { profile } from 'console';
import { UserResponseDto } from '../auth/dtos/auth.dto';

@Injectable()
export class ProfileService {
    constructor(private readonly prismaService: PrismaService) { }

    async profile(authUserId: number, profileId: number) {
        const user = await this.prismaService.users.findUnique({
            where: {
                id: profileId
            },
            include: {
                _count: {
                    select: {
                        news: true,
                        followers: true,
                        following: true,
                    }
                },
                news: {
                    include: {
                        _count: { select: { comments: true, } },
                        creator: true,
                    },
                },
            }
        })

        const newsList = []
        user.news.map(uNews => {
            newsList.push(
                new ResponseRecentTrendingNewsDto({
                    ...uNews, createdAt: `${formatDistance(Date.now(), uNews.createdAt)} ago`,
                    coverImage: `http://192.168.0.103:3000/news/images/${uNews.coverImage}`,
                    creator: { id: uNews.creator.id, profileImage: `http://192.168.0.103:3000/profile/images/${uNews.creator.profileImage}`, fullName: uNews.creator.fullName },
                    commentCounts: uNews._count.comments,
                })
            )
        })

        const follows = await this.prismaService.follows.findMany()
        var isFollowing = false
        follows.map(f => {
            if (f.followerId === authUserId && f.followingId === user.id) {
                isFollowing = true
            }
        })
        return new ResponseProfileDto({
            ...user,
            profileImage: user.profileImage != null ? `http://192.168.0.103:3000/profile/images/${user.profileImage}` : null,
            storiesCount: user._count.news,
            followersCount: user._count.followers,
            followingCount: user._count.following,
            isFollowing,
            userNews: newsList,
        },);
    }

    async updateProifle(
        authUserId: number,
        profileId: number,
        profileImage: Express.Multer.File,
        { fullName, username, bio, website, }: EditProfileDto,
    ) {
        if (authUserId === profileId) {
            const user = await this.prismaService.users.findUnique({
                where: { id: authUserId },
            })
            //console.log(`username:${username}`);
            const updateUser = await this.prismaService.users.update({
                data: {
                    fullName: fullName.length == 0 ? user.fullName : fullName,
                    username: username.length == 0 ? user.username : username,
                    bio,
                    profileImage: profileImage != undefined ? profileImage.filename : user.profileImage,
                },
                where: {
                    id: authUserId
                }
            })
            return new UserResponseDto({
                ...updateUser,
                profileImage: updateUser.profileImage != null ? `http://localhost:3000/profile/images/${updateUser.profileImage}` : null,
            });
        } else {
            throw new ForbiddenException("access dined")
        }
    }

}
