import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddTrendingNewsDto, CreateNewsDto, RecentNewsDto, ResponseRecentTrendingNewsDto, UpdatedNewsDto } from './dtos/news.dtos';
import { formatDistance } from 'date-fns';

@Injectable()
export class NewsService {
    constructor(private readonly prismaService: PrismaService) { }

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

    async trendingNews() {
        const trendingNews = await this.prismaService.news.findMany({
            where: {
                isTrending: true
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

        return trendingNews.map(trending =>
            new ResponseRecentTrendingNewsDto({
                ...trending, createdAt: `${formatDistance(Date.now(), trending.createdAt)} ago`,
                creator: { id: trending.creator.id, profileImage: `http://localhost:3000/profile/images/${trending.creator.profileImage}`, fullName: trending.creator.fullName },
                commentCounts: trending._count.comments
            })
        );
    }

    async getAllRecentNews({ tag }: RecentNewsDto) {
        const recentNews = await this.prismaService.news.findMany({
            where: {
                tagNews: {
                    every: {
                        tag: {
                            tag: tag
                        }
                    }
                }
            },
            include: {
                tagNews: {
                    select: {
                        tag: true
                    }
                },
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

        return recentNews.map(news =>
            new ResponseRecentTrendingNewsDto(
                {
                    ...news,
                    createdAt: `${formatDistance(Date.now(), news.createdAt)} ago`,
                    creator: { id: news.creator.id, profileImage: `http://localhost:3000/profile/images/${news.creator.profileImage}`, fullName: news.creator.fullName }
                }
            )
        )
    }
}
