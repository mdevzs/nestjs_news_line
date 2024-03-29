import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './home/home.module';
import { NewsModule } from './news/news.module';
import { DiscoverModule } from './discover/discover.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [UserModule, PrismaModule, HomeModule, NewsModule, DiscoverModule, PublicModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
