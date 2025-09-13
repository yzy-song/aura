import { ApiProperty } from '@nestjs/swagger';
import { TagType } from '@prisma/client';
import { IsString } from 'class-validator';
export class CreateTagDto {
  @ApiProperty({ example: '开心', description: '标签名称' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'EMOTION', description: '标签类型，EMOTION 或 ACTIVITY' })
  @IsString()
  type: TagType; // 必须是 EMOTION 或 ACTIVITY,以后可扩展
}
