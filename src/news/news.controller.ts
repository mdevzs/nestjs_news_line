import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { NewsService } from './news.service';
import { AuthenticationGuard } from 'src/user/guards/authentication.guard';
import { AddTrendingNewsDto, CreateNewsDto, RecentNewsDto, UpdatedNewsDto } from './dtos/news.dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Roles } from 'src/user/decorators/roles.decorators';
import { AuthorizationGuard } from 'src/user/guards/authorization.guard';

@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService) { }

    @UseInterceptors(FileInterceptor('coverImage', {
        storage: diskStorage({
            destination: './uploads/images',
            filename: (req, file, cb) => {
                const name = file.originalname.split('.')[0]
                const fileExtentios = file.originalname.split('.')[1]
                const newFile = `${name}_${Date.now()}.${fileExtentios}`
                cb(null, newFile)
            }
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(null, false)
            }
            cb(null, true)
        }
    }))
    @UseGuards(AuthenticationGuard)
    @Post()
    createNew(
        @Body() body: CreateNewsDto,
        @UploadedFile() coverImage: Express.Multer.File,
        @Req() { user }
    ) {
        return this.newsService.createNew(body, user.id, coverImage);
    }

    @Get('/:id')
    getNewsById(
        @Param('id') newsId: number,
    ) {
        return this.newsService.getNewsById(newsId)
    }

    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Put('add-news-to-trending/:id')
    addNewsToTrending(
        @Param('id') newsId: number,
        @Body() body: AddTrendingNewsDto
    ) {
        return this.newsService.addTrendingNews(body, newsId);
    }


    @UseGuards(AuthenticationGuard)
    @Put('/:id')
    updateNews(
        @Param('id') newsId: number,
        @Req() { user },
        @Body() body: UpdatedNewsDto
    ) {
        return this.newsService.updateNews(body, newsId, user.id);
    }

    @UseGuards(AuthenticationGuard)
    @Delete('/:id')
    deleteNews(
        @Param('id') newsId: number,
        @Req() { user },
    ) {
        return this.newsService.deleteNews(newsId, user.id);
    }

    @Get('/trending')
    trendingNews(
    ) {
        return this.newsService.trendingNews()
    }

    @Post('/recent')
    getAllRecentNews(
        @Body() body: RecentNewsDto,
    ) {
        return this.newsService.getAllRecentNews(body)
    }

    @Get('images/:fileId')
    async getfileUpload(@Param('fileId') fileId, @Res() res) {
        res.sendFile(fileId, { root: './uploads/images' });
    }
}
