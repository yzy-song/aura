import { Controller, Post, Body } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @ApiOperation({ summary: '创建一个用户档案' })
  @ApiResponse({ status: 201, description: '用户档案创建成功' })
  @ApiResponse({ status: 400, description: '请求参数或格式错误' })
  @ApiCommonResponses()
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }
}
