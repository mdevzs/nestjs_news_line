import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DiscoverService } from './discover.service';
import { AuthenticationGuard } from 'src/user/guards/authentication.guard';

@Controller('discover')
export class DiscoverController {
    constructor(private readonly discoverService: DiscoverService) { }

    @UseGuards(AuthenticationGuard)
    @Get()
    async discover(
        @Query('search') search: string,
        @Req() {user}
    ) {
        if (search !== undefined)
            return this.discoverService.discover(search,user.id);
        return this.discoverService.getDiscover(user.id);
    }
}
