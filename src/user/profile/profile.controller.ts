import { Controller, Get, Param, Res } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService:ProfileService){}

    @Get()
    async profile(){
        return this.profileService.profile(8);
    }

    @Get('images/:fileId')
    async getfileUpload(@Param('fileId') fileId, @Res() res) {
        res.sendFile(fileId, { root: './uploads/images' });
    }

}
