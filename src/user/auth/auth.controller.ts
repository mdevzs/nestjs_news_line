import { Body, Controller, HttpCode, Param, ParseEnumPipe, Post, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { GrOfficialKeyDto, SigninDto, SignupDto } from './dtos/auth.dto';
import { UserType } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs';
import { bindCallback } from 'rxjs';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @UseInterceptors(FileInterceptor('profileImage', {
        storage: diskStorage({
            destination: './uploads/images',
            filename: (req, file, cb) => {
                const name = file.originalname.split('.')[0]
                const fileExtentios = file.originalname.split('.')[1]
                const newFile = `${name}_${Date.now()}.${fileExtentios}`
                cb(null, newFile)
            }
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(null, false)
            }
            cb(null, true)
        }
    }))
    @Post('signup/:userType')
    async signup(
        @Body() body: SignupDto,
        @UploadedFile() file: Express.Multer.File,
        @Param('userType', new ParseEnumPipe(UserType)) userType: UserType
    ) {
        if (userType === UserType.official) {
            if (body.officialKey) {
                const plainSecret = `${body.email}-${userType}-${process.env.GENERATE_OFFICIAL_AUTHOR_SECRET}`
                const isOfficialKeyValid = await bcrypt.compare(plainSecret, body.officialKey)
                if (!isOfficialKeyValid) {
                    throw new UnauthorizedException("Invalid Official Author Key")
                }
            } else {
                throw new UnauthorizedException("Invalid Official Author Key")
            }
        }
        return this.authService.signup(body, file, userType);
    }

    @Post('signin')
    @HttpCode(200)
    async signin(
        @Body() body: SigninDto
    ) {
        return this.authService.signin(body);
    }

    @Post('verify-official-author')
    async verifyOfficialAuthor(
        @Body() body: GrOfficialKeyDto
    ) {
        return this.authService.grOfficialAuthorKey(body);
    }
}
