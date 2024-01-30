import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseDiscoverDto, ResponseDiscoverTagsDto, ResponseGetDiscoverDto } from './dtos/discover.dtos';
import { ResponseRecentTrendingNewsDto } from 'src/news/dtos/news.dtos';
import { formatDistance } from 'date-fns';
import { UserType } from '@prisma/client';
import { UserResponseDto } from 'src/user/auth/dtos/auth.dto';

@Injectable()
export class DiscoverService {
    constructor(private readonly prismaService: PrismaService) { }

    async discover(search: string, userId: number,) {
        const newsList = []
        const accountsList = []
        const tagsList = []
        const news = await this.prismaService.news.findMany({
            where: {
                OR: [
                    {
                        tagNews: {
                            every: {
                                tag: { tag: search }
                            }
                        }
                    },
                    {
                        title: { contains: search }
                    },
                ]
            },
            include: {
                _count: { select: { comments: true } },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImage: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        news.map(n =>
            newsList.push(
                new ResponseRecentTrendingNewsDto({
                    ...n, createdAt: `${formatDistance(Date.now(), n.createdAt)} ago`,
                    coverImage: `http://192.168.0.103:3000/news/images/${n.coverImage}`,
                    creator: { id: n.creator.id, profileImage: `http://192.168.0.103:3000/profile/images/${n.creator.profileImage}`, fullName: n.creator.fullName },
                    commentCounts: n._count.comments
                })
            )
        )
        const accounts = await this.prismaService.users.findMany({
            where: {
                OR: [
                    {
                        fullName: { contains: search },
                    },
                    {
                        username: { contains: search }
                    }
                ]
            }
        })
        const follows = await this.prismaService.follows.findMany()
        accounts.map(user => {
            var isFollowing = false
            follows.map(f => {
                if (f.followerId === userId && f.followingId === user.id) {
                    isFollowing = true
                }
            })
            accountsList.push(
                new UserResponseDto({
                    ...user,
                    profileImage: user.profileImage ? `http://192.168.0.103:3000/profile/images/${user.profileImage}` : null,
                    isFollowing
                }
                )
            )
            isFollowing = false
        })

        const tags = await this.prismaService.tags.findMany({
            where: {
                tag: { contains: search }
            },
            include: {
                _count: { select: { tagNews: true } }
            }
        })
        tags.map(tag => {
            tagsList.push(
                new ResponseDiscoverTagsDto({ ...tag, postsCount: tag._count.tagNews })
            )
        })

        return new ResponseDiscoverDto({ news: newsList, accounts: accountsList, tags: tagsList, })
    }

    async getDiscover(userId: number) {
        const officialPublisherList = []
        const popularAuthorsList = []
        const topNewsList = []
        const recommandedNewsList = []
        const top7DaysNews = await this.prismaService.news.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                _count: { select: { comments: true } },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImage: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        const popularOfficialPublisher = await this.prismaService.users.findMany({
            where: {
                userType: UserType.official
            }
        })
        const popularAuthors = await this.prismaService.users.findMany({
            where: {
                userType: UserType.author
            }
        })
        const follows = await this.prismaService.follows.findMany()
        const recommandedNews = await this.prismaService.news.findMany({
            include: {
                _count: { select: { comments: true } },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImage: true
                    }
                }
            }
        })

        recommandedNews.map(uNews =>
            recommandedNewsList.push(
                new ResponseRecentTrendingNewsDto({
                    ...uNews, createdAt: `${formatDistance(Date.now(), uNews.createdAt)} ago`,
                    coverImage: `http://192.168.0.103:3000/news/images/${uNews.coverImage}`,
                    creator: { id: uNews.creator.id, profileImage: `http://192.168.0.103:3000/profile/images/${uNews.creator.profileImage}`, fullName: uNews.creator.fullName },
                    commentCounts: uNews._count.comments
                })
            )
        )

        popularOfficialPublisher.map(publisher => {
            var isFollowing = false
            follows.map(f => {
                if (f.followerId === userId && f.followingId === publisher.id) {
                    isFollowing = true
                }
            })
            officialPublisherList.push(
                new UserResponseDto({
                    ...publisher,
                    profileImage: publisher.profileImage != null ? `http://192.168.0.103:3000/profile/images/${publisher.profileImage}` : null,
                    isFollowing: isFollowing,
                })
            )
            isFollowing = false
        })

        popularAuthors.map(author => {
            var isFollowing = false
            follows.map(f => {
                if (f.followerId === userId && f.followingId === author.id) {
                    isFollowing = true
                }
            })
            popularAuthorsList.push(
                new UserResponseDto({
                    ...author,
                    profileImage: author.profileImage != null ? `http://192.168.0.103:3000/profile/images/${author.profileImage}` : null,
                    isFollowing: isFollowing,
                })
            )
            isFollowing = false
        })

        top7DaysNews.map(news =>
            topNewsList.push(
                new ResponseRecentTrendingNewsDto({
                    ...news, createdAt: `${formatDistance(Date.now(), news.createdAt)} ago`,
                    coverImage: `http://192.168.0.103:3000/news/images/${news.coverImage}`,
                    creator: { id: news.creator.id, profileImage: `http://192.168.0.103:3000/profile/images/${news.creator.profileImage}`, fullName: news.creator.fullName },
                    commentCounts: news._count.comments
                })
            )
        )
        return new ResponseGetDiscoverDto({
            topNews: topNewsList,
            popularPublishers: officialPublisherList,
            popularAuthors: popularAuthorsList,
            recommandedNews: recommandedNewsList,
        })
    }
}   
