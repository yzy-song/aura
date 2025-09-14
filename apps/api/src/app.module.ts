import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { TagsModule } from './tags/tags.module';
import { ProfilesModule } from './profiles/profiles.module';
import { MoodEntriesModule } from './mood-entries/mood-entries.module';
import { InsightsModule } from './insights/insights.module';
import { AiModule } from './common/ai/ai.module';
import { AppLogger } from './common/utils/logger';

@Module({
  imports: [
    // 设置.env配置文件为全局可用
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    TagsModule,
    ProfilesModule,
    MoodEntriesModule,
    InsightsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppLogger],
})
export class AppModule {}
