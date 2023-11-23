import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddTrendingNewsDto, CreateNewsDto, RecentNewsDto, ResponseNewsByIdDto, ResponseRecentTrendingNewsDto, UpdatedNewsDto } from './dtos/news.dtos';
import { formatDistance } from 'date-fns';
import { UserResponseDto } from 'src/user/auth/dtos/auth.dto';
import { CommentsService } from './comments/comments.service';
import { createPaginator } from 'prisma-pagination';
import { Prisma } from '@prisma/client';

@Injectable()
export class NewsService {
    constructor(private readonly prismaService: PrismaService, private readonly commentsService: CommentsService) { }

    async createNew({ title, description, readTime, tags }: CreateNewsDto, creatorId: number, coverImage: Express.Multer.File) {
        const news = await this.prismaService.news.create({
            data: {
                title,
                coverImage: coverImage.filename,
                description,
                readTime,
                viewsCount: '0',
                creatorId,
                tagNews: {
                    create: tags.map(id => ({
                        tagId: parseInt(id)
                    }))
                }
            }
        })
        return { ...news, coverImage: `http://localhost:3000/news/images/${news.coverImage}` };
    }

    async getNewsById(newsId: number) {
        const news = await this.prismaService.news.findFirst({
            where: {
                id: newsId
            },
            include: {
                tagNews: {
                    include: {
                        tag: true
                    }
                },
                creator: true,
                comments: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullName: true,
                                profileImage: true,
                            }
                        }
                    }
                },
            }
        })

        const comments = await this.commentsService.getAllNewsComments(newsId)
        const userNews = await this.getAllUserNews(news.creator.id)

        return new ResponseNewsByIdDto({
            ...news,
            coverImage: `http://localhost:3000/news/images/${news.coverImage}`,
            creator: new UserResponseDto({
                ...news.creator,
                profileImage: news.creator.profileImage !== null ? `http://localhost:3000/profile/images/${news.creator.profileImage}` : null
            }),
            comments: comments,
            userNews,
            createdAt: `${formatDistance(Date.now(), news.createdAt)} ago`
        }
        )
    }

    async getAllUserNews(userId: number) {
        const userNews = await this.prismaService.news.findMany({
            where: {
                creatorId: userId
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
            }
        })
        return userNews.map(uNews =>
            new ResponseRecentTrendingNewsDto({
                ...uNews, createdAt: `${formatDistance(Date.now(), uNews.createdAt)} ago`,
                coverImage: `http://localhost:3000/news/images/${uNews.coverImage}`,
                creator: { id: uNews.creator.id, profileImage: `http://localhost:3000/profile/images/${uNews.creator.profileImage}`, fullName: uNews.creator.fullName },
                commentCounts: uNews._count.comments
            })
        );
    }

    async addTrendingNews({ isTrending }: AddTrendingNewsDto, newsId: number) {
        const news = await this.prismaService.news.findUnique({
            where: {
                id: newsId
            }
        })
        if (!news) {
            throw new NotFoundException()
        }

        const updatedNews = await this.prismaService.news.update({
            data: { isTrending },
            where: { id: newsId }
        })

        return updatedNews;
    }

    async updateNews(data: UpdatedNewsDto, newsId: number, userId: number) {
        const news = await this.prismaService.news.findUnique({
            where: {
                id: newsId
            }
        })
        if (!news) {
            throw new NotFoundException()
        }
        if (news.creatorId !== userId) {
            throw new ForbiddenException()
        }

        const updatedNews = await this.prismaService.news.update({
            where: { id: newsId },
            data
        })

        return updatedNews;
    }

    async deleteNews(newsId: number, userId: number) {
        const news = await this.prismaService.news.findUnique({
            where: {
                id: newsId
            }
        })
        if (!news) {
            throw new NotFoundException()
        }
        if (news.creatorId !== userId) {
            throw new ForbiddenException()
        }

        await this.prismaService.news.delete({
            where: { id: newsId }
        })
    }

    async allTrendingNews(page: string, perPage: string,) {        
        const paginate = createPaginator({ perPage: perPage ?? '10' });
        const result = paginate<ResponseRecentTrendingNewsDto, Prisma.NewsFindManyArgs>(
            this.prismaService.news,
            {
                where:{isTrending:true},
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
            },
            {
                page: page ?? '1',
            },
        );
        (await result).data.map(news => {
            news.coverImage = news.coverImage != null ? `http://192.168.0.103:3000/news/images/${news.coverImage}` : null
            news.createdAt = `${formatDistance(Date.now(), Number(news.createdAt))} ago`
            news.commentCounts = news._count.comments
            news.creator = { id: news.creator.id, fullName: news.creator.fullName, profileImage: news.creator.profileImage != null ? `http://192.168.0.103:3000/profile/images/${news.creator.profileImage}` : null }
        })
        return result
    }

    async getAllRecentNews({ tag }: RecentNewsDto, page: string, perPage: string) {
        var whereCondition = {}
        if (tag !== 'all') {
            whereCondition = {
                tagNews: {
                    every: {
                        tag: {
                            tag: {
                                contains: tag,
                                mode: 'insensitive',
                            }

                        }
                    }
                }
            }
        }

        const paginate = createPaginator({ perPage: perPage ?? '10' });
        const result = paginate<ResponseRecentTrendingNewsDto, Prisma.NewsFindManyArgs>(
            this.prismaService.news,
            {
                where: whereCondition,
                include: {
                    tagNews: {
                        select: {
                            tag: true
                        }
                    },
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
            },
            {
                page: page ?? '1',
            },
        );
        (await result).data.map(news => {
            news.coverImage = news.coverImage != null ? `http://192.168.0.103:3000/news/images/${news.coverImage}` : null
            news.createdAt = `${formatDistance(Date.now(), Number(news.createdAt))} ago`
            news.commentCounts = news._count.comments
            news.creator = { id: news.creator.id, fullName: news.creator.fullName, profileImage: news.creator.profileImage != null ? `http://192.168.0.103:3000/profile/images/${news.creator.profileImage}` : null }
        })
        return result;

        // const recentNews = await this.prismaService.news.findMany({
        //     where: whereCondition,
        //     include: {
        //         tagNews: {
        //             select: {
        //                 tag: true
        //             }
        //         },
        //         _count: { select: { comments: true } },
        //         creator: {
        //             select: {
        //                 id: true,
        //                 fullName: true,
        //                 profileImage: true
        //             }
        //         }
        //     },
        //     orderBy: {
        //         createdAt: 'desc'
        //     }
        // })

        // var recent = []
        // var pPerPaage
        // recentNews.forEach(news => {
        //     if (pPerPaage <= perPage) {
        //         news.tagNews.forEach(tagNews => {
        //             tags.push(new ResponseTagDto({ ...tagNews.tag, image: `http://192.168.0.103:3000/public/images/${tagNews.tag.image}` }))
        //         })
        //         recent.push(
        //             new ResponseRecentTrendingNewsDto(
        //                 {
        //                     ...news,
        //                     coverImage: news.coverImage != null ? `http://192.168.0.103:3000/news/images/${news.coverImage}` : null,
        //                     createdAt: `${formatDistance(Date.now(), news.createdAt)} ago`,
        //                     creator: { id: news.creator.id, profileImage: `http://192.168.0.103:3000/profile/images/${news.creator.profileImage}`, fullName: news.creator.fullName },
        //                     commentCounts: news._count.comments,
        //                     tagNews: tags
        //                 }
        //             )
        //         )
        //         tags = []
        //         pPerPaage
        //     }
        // });
        // (await result).data = recent
        // return result

    }
}
