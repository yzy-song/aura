import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class CreateProfileDto {
  @ApiProperty({ example: '匿名用户', description: '匿名名称' })
  @IsString()
  anonymousName: string;

  @ApiProperty({ example: 'avatar123', description: '头像ID' })
  @IsString()
  avatarId: string;
}
