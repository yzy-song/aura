import { ApiProperty } from '@nestjs/swagger'; // 1. 导入 ApiProperty
import { IsArray, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMoodEntryDto {
  @ApiProperty({
    description: '情绪记录的备注文字',
    example: '今天天气很好，很开心！',
    required: false, // 告诉 Swagger 这是可选的
  })
  @IsOptional() // 验证：这个字段是可选的
  @IsString() // 验证：必须是字符串
  note?: string;

  @ApiProperty({
    description: '关联的标签ID数组',
    example: [1, 7],
    type: [Number], // 告诉 Swagger 这是一个数字数组
  })
  @IsArray() // 验证：必须是一个数组
  @IsInt({ each: true }) // 验证：数组中的每个元素都必须是整数
  tagIds: number[];
}
