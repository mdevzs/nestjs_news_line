import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JSON_TOKEN_KEY,
      signOptions: { expiresIn: "7d" }
    })
  ],  
  controllers: [AuthController, ProfileController],
  providers: [AuthService, {
    provide: APP_INTERCEPTOR,
    useClass: ClassSerializerInterceptor
  }, ProfileService]
})
export class UserModule {}
