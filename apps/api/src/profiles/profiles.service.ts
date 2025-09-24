import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
@Injectable()
export class ProfilesService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}
  private readonly logger = new Logger(ProfilesService.name);

  create(createProfileDto: CreateProfileDto) {
    // DTO 的内容将在下一步定义
    return this.prisma.profile.create({
      data: createProfileDto,
    });
  }

  // 更新昵称
  async updateProfile(profileId: string, updateProfileDto: UpdateProfileDto) {
    this.logger.log(`Updating profile for user ${profileId}`);
    return this.prisma.profile.update({
      where: { id: profileId },
      data: { anonymousName: updateProfileDto.anonymousName },
    });
  }

  // 上传头像
  async uploadAvatar(profileId: string, file: Express.Multer.File) {
    this.logger.log(`Uploading avatar for user ${profileId}`);
    const uploadResult = await this.cloudinary.uploadImage(file);

    return this.prisma.profile.update({
      where: { id: profileId },
      data: { avatarUrl: uploadResult.secure_url },
    });
  }
}
