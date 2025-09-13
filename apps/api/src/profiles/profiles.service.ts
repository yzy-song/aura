import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  create(createProfileDto: CreateProfileDto) {
    // DTO 的内容将在下一步定义
    return this.prisma.profile.create({
      data: createProfileDto,
    });
  }
}
