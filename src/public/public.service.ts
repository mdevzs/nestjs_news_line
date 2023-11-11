import { Injectable } from '@nestjs/common';
import { createPaginator } from 'prisma-pagination';
import { PrismaService } from 'src/prisma/prisma.service';
import { CountriesDto, TagsResponseDto } from './dtos/public.dtos';
import { Prisma, UserType } from '@prisma/client';
import { ta } from 'date-fns/locale';
import { ResponseProfileDto } from 'src/user/profile/dtos/profile.dtos';
import { userInfo } from 'os';
import { UserResponseDto } from 'src/user/auth/dtos/auth.dto';

@Injectable()
export class PublicService {
    constructor(private readonly prismaService: PrismaService) { }

    async getAllCountries(
        q: string,
        page: string,
        perPage: string,
    ) {
        const paginate = createPaginator({ perPage: perPage ?? '10' });

        return paginate<CountriesDto, Prisma.CountriesFindManyArgs>(
            this.prismaService.countries,
            {
                where: { name: { contains: q, mode: 'insensitive' } }
            },
            {
                page: page ?? '1',
            }
        )
    }

    async getAllTags() {
        const tags = await this.prismaService.tags.findMany();
        return tags.map(tag =>
            new TagsResponseDto(
                {
                    ...tag,
                    imageUrl: `http://192.168.0.103:3000/public/images/${tag.image}`
                }
            )
        )
    }

    async getAllOfficialAuthor() {
        const officialAuthors = await this.prismaService.users.findMany(
            {
                where: {
                    userType: UserType.official,
                }
            }
        )
        return officialAuthors.map(user =>
            new UserResponseDto({ ...user, profileImage: `http://192.168.0.103:3000/profile/images/${user.profileImage}` })
        )
    }

}


