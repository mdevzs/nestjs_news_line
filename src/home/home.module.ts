import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NewsModule } from 'src/news/news.module';

@Module({
  imports:[PrismaModule,UserModule,NewsModule],
  providers: [HomeService],
  controllers: [HomeController]
})
export class HomeModule {}
