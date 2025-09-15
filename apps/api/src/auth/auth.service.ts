import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from '../common/firebase/firebase-admin.service';
import { JwtService } from '@nestjs/jwt';
import type { Profile } from '@aura/database/prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private firebaseAdmin: FirebaseAdminService,
    private jwtService: JwtService,
  ) {}

  async firebaseLogin(
    idToken: string,
    anonymousProfileId: string | null,
  ): Promise<{ accessToken: string; profile: Profile }> {
    let decodedToken;
    try {
      decodedToken = await this.firebaseAdmin.auth.verifyIdToken(idToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase ID token.');
    }

    const { uid, name } = decodedToken;

    // 1. 检查这个 Firebase 身份是否已经存在
    const identity = await this.prisma.identity.findUnique({
      where: { provider_providerId: { provider: 'firebase', providerId: uid } },
      include: { profile: true }, // 同时把关联的 Profile 也查出来
    });

    // 如果身份已存在，说明是老用户登录，直接返回他/她的 Profile 和新 Token
    if (identity) {
      this.logger.log(`Returning user found via Firebase UID: ${uid}`);
      return this.generateAuraToken(identity.profile);
    }

    // 2. 如果身份不存在，我们需要将其链接到 Profile
    this.logger.log(`New Firebase UID: ${uid}. Attempting to link or create profile.`);
    let targetProfile: Profile;

    if (anonymousProfileId) {
      // 优先使用当前匿名用户的 Profile
      targetProfile = await this.prisma.profile.findUnique({ where: { id: anonymousProfileId } });
      if (!targetProfile) {
        // 如果匿名ID无效，则创建一个新的 Profile
        targetProfile = await this.createNewProfile(name, uid);
      }
    } else {
      // 如果连匿名ID都没有，直接创建一个新的 Profile
      targetProfile = await this.createNewProfile(name, uid);
    }

    // 3. 为目标 Profile 创建并链接新的 Firebase 身份
    await this.prisma.identity.create({
      data: {
        provider: 'firebase',
        providerId: uid,
        profileId: targetProfile.id,
      },
    });

    this.logger.log(`Successfully linked Firebase UID ${uid} to Profile ${targetProfile.id}`);
    return this.generateAuraToken(targetProfile);
  }

  private async createNewProfile(name: string, uid: string): Promise<Profile> {
    return this.prisma.profile.create({
      data: {
        anonymousName: name || `User #${uid.slice(0, 5)}`,
        avatarId: `avatar-${Math.floor(Math.random() * 10)}`,
      },
    });
  }

  private generateAuraToken(profile: Profile): { accessToken: string; profile: Profile } {
    const payload = { sub: profile.id };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, profile };
  }
}
