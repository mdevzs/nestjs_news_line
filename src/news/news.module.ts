import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommentsService } from './comments/comments.service';
import { CommentsController } from './comments/comments.controller';

@Module({
  imports: [PrismaModule],
  controllers: [NewsController, CommentsController],
  providers: [NewsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    CommentsService,
  ]
})
export class NewsModule { }
