import { Injectable } from '@nestjs/common';
import { CommnetNewsDto, ResponseCommnetNewsDto } from './dtos/comments.dtos';
import { PrismaService } from 'src/prisma/prisma.service';
import { count } from 'rxjs';
import { formatDistance } from 'date-fns';

@Injectable()
export class CommentsService {
    constructor(private readonly prismaService: PrismaService) { }

    async addComments({ comment, parentId }: CommnetNewsDto, userId: number, newsId: number) {
        await this.prismaService.comments.create({
            data: {
                comment,
                creatorId: userId,
                newsId,
                parentId
            }
        })
    }

    async getAllNewsComments(newsId: number) {
        const comments = await this.prismaService.comments.findMany({
            where: {
                newsId
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImage: true,
                    }
                }
            }
        })
        const likeCounts = await this.prismaService.commentLikes.aggregate({
            _count: { commentId: true }
        })
        return comments.map(comment => 
            new ResponseCommnetNewsDto({
                ...comment,
                likeCounts: likeCounts._count.commentId,
                createdAt:`${formatDistance(Date.now(),comment.createdAt)} ago`
            })
        );
    }

    async likeComment(commentId: number, userId: number) {
        const likeExist = await this.prismaService.commentLikes.findFirst({
            where: {
                commentId,
                userId
            }
        })

        if (!likeExist) {
            const likeCommnet = await this.prismaService.commentLikes.create({
                data: {
                    commentId,
                    userId
                },
                select: {
                    comment: true,
                },

            })
            const likeCounts = await this.prismaService.commentLikes.aggregate({
                _count: { commentId: true }
            })
            return new ResponseCommnetNewsDto({
                ...likeCommnet,
                likeCounts: likeCounts._count.commentId
            })
        }
        const likeCommnet = await this.prismaService.commentLikes.delete({
            where: {
                id: likeExist.id
            }
        })
        return likeCommnet;
    }
}
