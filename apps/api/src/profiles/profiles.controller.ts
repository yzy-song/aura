import {
  Controller,
  Get,
  Body,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import type { Profile } from '@aura/database/prisma/client';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProfileDto } from './dto/create-profile.dto';
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved current user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing authentication token.' })
  @ApiCommonResponses()
  getCurrentProfile(@CurrentProfile() profile: Profile) {
    return profile;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user name' })
  @ApiResponse({ status: 200, description: 'Successfully updated current user name.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing authentication token.' })
  @ApiCommonResponses()
  updateProfile(@CurrentProfile('id') profileId: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.updateProfile(profileId, updateProfileDto);
  }

  @Patch('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload or update current user avatar' })
  @ApiResponse({ status: 200, description: 'Successfully uploaded/updated current user avatar.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing authentication token.' })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid file upload.' })
  @ApiCommonResponses()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadAvatar(
    @CurrentProfile('id') profileId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })], // 5MB limit
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.profilesService.uploadAvatar(profileId, file);
  }
}
