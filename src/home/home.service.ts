import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileService } from 'src/user/profile/profile.service';
import { ResponseHomeDto } from './dtos/home.dtos';
import { NewsService } from 'src/news/news.service';

@Injectable()
export class HomeService {
    constructor(private readonly prismaService: PrismaService,
        private readonly profileService: ProfileService,
        private readonly newsService: NewsService
    ) { }

    async home(userId: number) {
        const user = await this.profileService.profile(userId);
        const trendingNews = await this.newsService.trendingNews()
        const recentNews = await this.newsService.getAllRecentNews({ tag: 'all' })
        const tags = await this.prismaService.tags.findMany()


        return new ResponseHomeDto({ user, trendingNews, tags, recentNews });
    }
}
