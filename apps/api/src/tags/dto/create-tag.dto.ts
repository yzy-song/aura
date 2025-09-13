import { ApiProperty } from '@nestjs/swagger';
import { TagType } from '@aura/database/prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'The name of the tag', example: 'Meditating' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'The type of the tag', enum: TagType, example: TagType.ACTIVITY })
  @IsEnum(TagType)
  type: TagType;

  // 👇 --- 添加 emoji 字段 --- 👇
  @ApiProperty({ description: 'The emoji for the tag', example: '🧘', required: false })
  @IsOptional() // 这个字段是可选的
  @IsString()
  @MaxLength(8) // Emoji 通常占 2-4 个字符
  emoji?: string;
}
