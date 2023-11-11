import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { PublicService } from './public.service';
import { ApiPaginatedResponse } from './decorators/public.decorators';
import { CountriesDto } from './dtos/public.dtos';

@Controller('public')
export class PublicController {
    constructor(private readonly publicService: PublicService) { }

    @Get('/countries')
    @ApiPaginatedResponse(CountriesDto)
    async getAllContries(
        @Query('q') q: string,
        @Query('page') page: string,
        @Query('perPage') perPage: string,
    ) {
        if (page === undefined) {
            console.log('page is undefined');
        }else{
            console.log(page);
            
        }
        if (q === undefined) {
            console.log('q is undefined');
        }else{
            console.log(q);
            
        }
        return this.publicService.getAllCountries(
            q,
            page,
            perPage
        );
    }

    @Get('/tags')
    getAllTags(){
        return this.publicService.getAllTags();
    }

    @Get('/official-authors')
    getAllOfficialAuthors(){
        return this.publicService.getAllOfficialAuthor();
    }

    @Get('images/:fileId')
    async getfileUpload(@Param('fileId') fileId, @Res() res) {
        res.sendFile(fileId, { root: './assets/tags_image' });
    }
}


