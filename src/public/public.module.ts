import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PublicController } from './public.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PublicController],
  providers: [PublicService],  
})
export class PublicModule { }
