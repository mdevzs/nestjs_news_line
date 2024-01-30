import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileService } from 'src/user/profile/profile.service';
import { ResponseHomeDto, ResponseTagDto } from './dtos/home.dtos';
import { NewsService } from 'src/news/news.service';

@Injectable()
export class HomeService {
    constructor(private readonly prismaService: PrismaService,
        private readonly profileService: ProfileService,
        private readonly newsService: NewsService
    ) { }

    async home(userId: number) {
        const user = await this.profileService.profile(userId, userId,);
        const trendingNews = await this.newsService.allTrendingNews('1', '5')
        //const recentNews = await this.newsService.getAllRecentNews({ tag: 'all' },'1','10',)
        const tags = await this.prismaService.tags.findMany()
        const tagsWithImage = tags.map(tag => new ResponseTagDto({ ...tag, image: `http://192.168.0.103:3000/public/images/${tag.image}` }))

        return new ResponseHomeDto({ user, trendingNews: trendingNews.data, tags: tagsWithImage });
    }
}
