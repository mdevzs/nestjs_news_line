import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthenticationGuard } from '../guards/authentication.guard';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @UseGuards(AuthenticationGuard)
    @Get(':profileId')
    async profile(
        @Req() { user },
        @Param('profileId') profileId: string,
    ) {
        return this.profileService.profile(user.id, parseInt(profileId),);
    }

    @Get('images/:fileId')
    async getfileUpload(@Param('fileId') fileId, @Res() res) {
        res.sendFile(fileId, { root: './uploads/images' });
    }

}
