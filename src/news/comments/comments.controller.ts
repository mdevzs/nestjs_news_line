import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from 'src/user/guards/authentication.guard';
import { CommnetNewsDto } from './dtos/comments.dtos';
import { CommentsService } from './comments.service';

@Controller('news')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @UseGuards(AuthenticationGuard)
    @Post('/:id/comments')
    addCommnetNews(
        @Param('id') newsId: number,
        @Body() body: CommnetNewsDto,
        @Req() { user },
    ) {
        return this.commentsService.addComments(body, user.id, newsId);
    }

    @UseGuards(AuthenticationGuard)
    @Get('/:id/comments')
    getAllComments(
        @Param('id') newsId: number,
        @Req() { user },
    ) {
        return this.commentsService.getAllNewsComments(newsId, user.id);
    }

    @UseGuards(AuthenticationGuard)
    @Get('/comments/:id')
    likeComment(
        @Param('id') commentId: number,
        @Req() { user },
    ) {
        return this.commentsService.likeComment(commentId, user.id);
    }
}
