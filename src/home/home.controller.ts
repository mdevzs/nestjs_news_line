import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from 'src/user/guards/authentication.guard';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
    constructor(private readonly homeSerive: HomeService) { }

    @UseGuards(AuthenticationGuard)
    @Get()
    async home(
        @Req() { user }
    ) {
        return this.homeSerive.home(user.id);
    }

}
