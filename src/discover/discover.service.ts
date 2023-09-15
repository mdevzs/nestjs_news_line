import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseDiscoverDto } from './dtos/discover.dtos';

@Injectable()
export class DiscoverService {
    constructor(private readonly prismaService: PrismaService) { }

    async discover(search: string) {
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
            }
        })
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

        return new ResponseDiscoverDto({ news, accounts })
    }
}   
