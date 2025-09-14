import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 1. 导入 ConfigModule
import { AiService } from './ai.service';

@Module({
  imports: [ConfigModule], // 2. 导入 ConfigModule，这样 AiService 才能使用 ConfigService
  providers: [AiService], // 3. “提供” AiService
  exports: [AiService], // 4. “导出” AiService，让其他模块能用
})
export class AiModule {}
