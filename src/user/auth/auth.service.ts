import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GrOfficialKeyDto, SigninDto, SignupDto, UserResponseDto } from './dtos/auth.dto';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService, private readonly jwtService: JwtService) { }

    async signup({ fullName, email, phone, username, password, gender, country, bio, following, intrestedTags, dateOfBirth }: SignupDto, image: Express.Multer.File, userType: UserType) {

        const emailExitst = await this.prismaService.users.findUnique({
            where: {
                email
            }
        })
        const phoneExitst = await this.prismaService.users.findUnique({
            where: {
                phone,
            },
        })
        const usernameExitst = await this.prismaService.users.findUnique({
            where: {
                username,
            },
        })
        if (emailExitst) {
            throw new ConflictException('The email already taken!')
        }
        if (phoneExitst) {
            throw new ConflictException('User exist with this phone please choose another phone number!')
        }
        if (usernameExitst) {
            throw new ConflictException('The username already taken!')
        }


        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await this.prismaService.users.create({
            data: {
                fullName,
                email,
                phone,
                username,
                password: hashedPassword,
                dateOfBirth,
                gender,
                country,
                bio,
                profileImage: image != undefined ? image.filename : null,
                userType: userType,
                intrestedTags: {
                    create: intrestedTags?.map(id => ({
                        tagId: parseInt(id)
                    }))
                },
                following: {
                    create: following?.map(id => ({
                        followingId: parseInt(id)
                    }))
                }
            }
        })
        const token = await this.generateJWT(user.id, user.fullName)
        return new UserResponseDto({
            ...user,
            profileImage: user.profileImage != null ? `http://localhost:3000/profile/images/${user.profileImage}` : null,
            token,
        });
    }

    async signin({ email, password }: SigninDto) {
        const userExist = await this.prismaService.users.findUnique({
            where: {
                email
            }
        })

        if (!userExist) {
            throw new HttpException("Invalid Credential", 400)
        }

        const hashedPassword = userExist.password
        const isPasswordValid = await bcrypt.compare(password, hashedPassword)

        if (!isPasswordValid) {
            throw new HttpException("Invalid Credential", 400)
        }

        const token = await this.generateJWT(userExist.id, userExist.fullName)
        return new UserResponseDto({
            ...userExist,
            profileImage: userExist.profileImage != null ? `http://localhost:3000/profile/images/${userExist.profileImage}` : null,
            token
        })
    }

    async followAuthor(followerId: string, followingId: string) {
        const isFollowed = await this.prismaService.follows.findFirst(
            {
                where: {
                    followerId: { equals: parseInt(followerId) },
                    followingId: { equals: parseInt(followingId) }
                }
            }
        )

        if (!isFollowed) {
            await this.prismaService.follows.create({
                data: {
                    followerId: parseInt(followerId),
                    followingId: parseInt(followingId),
                }
            })
        } else {
            await this.prismaService.follows.delete(
                {
                    where: {
                        id: isFollowed.id
                    }
                }
            )
        }
    }

    async grOfficialAuthorKey({ email, userType }: GrOfficialKeyDto) {
        const secret = `${email}-${userType}-${process.env.GENERATE_OFFICIAL_AUTHOR_SECRET}`

        const key = await bcrypt.hash(secret, 10)
        return { key };
    }

    private generateJWT(id: number, name: string) {
        return this.jwtService.signAsync({ 'id': id, 'name': name })
    }
}
