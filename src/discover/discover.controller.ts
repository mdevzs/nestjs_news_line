import { Controller, Get, Post, Query } from '@nestjs/common';
import { DiscoverService } from './discover.service';

@Controller('discover')
export class DiscoverController {
    constructor(private readonly discoverService:DiscoverService){}

    @Get()
    async discover(
        @Query('search') search: string,
    ) {
        return this.discoverService.discover(search);
    }
}
