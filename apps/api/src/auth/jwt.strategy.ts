import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Passport 在验证 Token 签名有效后，会自动调用这个方法
   * @param payload - Token 解码后的 JSON 对象 (我们在 AuthService 里存了 { sub: profile.id })
   */
  async validate(payload: { sub: string }) {
    // 👇 核心修正：去 Profile 表里查找用户
    const profile = await this.prisma.profile.findUnique({
      where: { id: payload.sub },
    });

    if (!profile) {
      throw new UnauthorizedException('Invalid token or user does not exist.');
    }
    // 返回的 profile 对象会被 Passport 自动附加到 request.user 上
    return profile;
  }
}
