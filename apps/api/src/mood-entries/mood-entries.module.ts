import { Module } from '@nestjs/common';
import { MoodEntriesService } from './mood-entries.service';
import { MoodEntriesController } from './mood-entries.controller';

@Module({
  controllers: [MoodEntriesController],
  providers: [MoodEntriesService],
})
export class MoodEntriesModule {}
