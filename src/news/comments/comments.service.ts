import { Injectable } from '@nestjs/common';
import { CommnetNewsDto, ResponseCommnetNewsDto, ResponseGetAllCommentsDto } from './dtos/comments.dtos';
import { PrismaService } from 'src/prisma/prisma.service';
import { count } from 'rxjs';
import { formatDistance } from 'date-fns';

@Injectable()
export class CommentsService {
    constructor(private readonly prismaService: PrismaService) { }

    async addComments({ comment, parentId }: CommnetNewsDto, userId: number, newsId: number) {
        const newComment = await this.prismaService.comments.create({
            data: {
                comment,
                creatorId: userId,
                newsId,
                parentId
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImage: true,
                    }
                },
                comments: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullName: true,
                                profileImage: true,
                            }
                        },
                        commentLikes: true,
                    }
                },
                commentLikes: true,
            }
        })
        return new ResponseCommnetNewsDto({
            ...newComment,
            creator: { id: newComment.creator.id, fullName: newComment.creator.fullName, profileImage: newComment.creator.profileImage != null ? `http://192.168.0.103:3000/profile/images/${newComment.creator.profileImage}` : null, },
            isLiked: false,
            likeCounts: 0,
            createdAt: `${formatDistance(Date.now(), newComment.createdAt)} ago`,
        });
    }

    async getAllNewsComments(newsId: number, userId: number) {
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
                },
                comments: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullName: true,
                                profileImage: true,
                            }
                        },
                        commentLikes: true,
                    }
                },
                commentLikes: true,
            },
            orderBy: { createdAt: 'desc', }
        })
        // const likeCounts = await this.prismaService.commentLikes.aggregate({
        //     _count: { commentId: true }
        // })
        const topNews: ResponseCommnetNewsDto[] = []
        var newestNews: ResponseCommnetNewsDto[] = []
        var replies = []
        var isLiked = false
        var likeCounts = 0
        var replyCommentIsLiked = false
        var replyLikeCounts = 0
        comments.map(comment => {
            comment.commentLikes.map(likes => {
                //console.log(`current userId is: ${userId}`)
                //console.log(`liked userId is: ${likes.userId}`)
                if (!isLiked) {
                    isLiked = likes.userId === userId
                    //console.log(`is current user liked it?: ${isLiked}`)
                }
                //if (likes.userId === userId) {
                likeCounts++
                //}
            })
            //console.log(`is current user liked it?: ${isLiked}`)

            comment.comments.map(reply => {
                reply.commentLikes.map(likes => {
                    if (!replyCommentIsLiked) {
                        replyCommentIsLiked = likes.userId === userId
                    }
                    //if (likes.commentId === reply.id) {
                    replyLikeCounts++
                    //}
                })
                replies.push(
                    new ResponseCommnetNewsDto({
                        ...reply,
                        creator: { id: reply.creator.id, fullName: reply.creator.fullName, profileImage: reply.creator.profileImage != null ? `http://192.168.0.103:3000/profile/images/${reply.creator.profileImage}` : null, },
                        isLiked: replyCommentIsLiked,
                        likeCounts: replyLikeCounts,
                        createdAt: `${formatDistance(Date.now(), reply.createdAt)} ago`,
                    })
                )
                replyLikeCounts = 0
                replyCommentIsLiked = false
            })
            //console.log(`is current user liked it?: ${isLiked}`)

            if (comment.parentId === null) {
                topNews.push(
                    new ResponseCommnetNewsDto({
                        ...comment,
                        creator: { id: comment.creator.id, fullName: comment.creator.fullName, profileImage: comment.creator.profileImage != null ? `http://192.168.0.103:3000/profile/images/${comment.creator.profileImage}` : null, },
                        isLiked: isLiked,
                        likeCounts: likeCounts,
                        createdAt: `${formatDistance(Date.now(), comment.createdAt)} ago`,
                        replies: replies,
                    })
                )
                newestNews.push(
                    new ResponseCommnetNewsDto({
                        ...comment,
                        creator: { id: comment.creator.id, fullName: comment.creator.fullName, profileImage: comment.creator.profileImage != null ? `http://192.168.0.103:3000/profile/images/${comment.creator.profileImage}` : null, },
                        isLiked: isLiked,
                        likeCounts: likeCounts,
                        createdAt: `${formatDistance(Date.now(), comment.createdAt)} ago`,
                        replies: replies,
                    })
                )
            }
            isLiked = false
            likeCounts = 0
            replies = []
            //console.log(`is current user liked it?: ${isLiked}`)

        });
        topNews.sort((n1, n2) => n2.likeCounts - n1.likeCounts)
        return new ResponseGetAllCommentsDto({
            top: topNews,
            newest: newestNews,
        })
    }

    async likeComment(commentId: number, userId: number) {
        console.log(`the commented like id is ${commentId}`);
        const likeExist = await this.prismaService.commentLikes.findFirst({
            where: {
                commentId,
                userId
            },
            include: {
                comment: true,
            }
        })
        //console.log(`like id is ${likeExist.id}`);
        var likeCounts = 0
        if (!likeExist) {
            const comment = await this.prismaService.commentLikes.create({
                data: {
                    commentId,
                    userId
                },
                include: {
                    comment: true,
                },
            })
            console.log('comment liked!')

            const likeCounts = await this.prismaService.commentLikes.aggregate({
                _count: {
                    commentId: true
                },
                where: {
                    commentId: { equals: commentId }
                }
            })
            return new ResponseCommnetNewsDto({
                ...comment,
                likeCounts: likeCounts._count.commentId
            })
        } else {
            await this.prismaService.commentLikes.delete({
                where: {
                    id: likeExist.id
                }
            })
            const likeCounts = await this.prismaService.commentLikes.aggregate({
                _count: {
                    commentId: true
                },
                where: {
                    commentId: { equals: commentId }
                }
            })
            console.log('comment unLiked!')
            return new ResponseCommnetNewsDto({
                ...likeExist,
                likeCounts: likeCounts._count.commentId
            })
        }

        //return likeCommnet;
    }
}
