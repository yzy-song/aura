import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import type { Profile as ProfileModel } from '@aura/database/prisma/client';

export const CurrentProfile = createParamDecorator((data: keyof ProfileModel, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  // 1. 优先从 request.user 中获取已登录 Profile
  const profile = request.user;

  if (profile) {
    return data ? profile?.[data] : profile;
  }

  // 2. 游客，回退到 header
  const anonymousProfileId = request.headers['x-profile-id'];
  if (anonymousProfileId) {
    return anonymousProfileId;
  }

  // 3. 都没有，抛异常或返回 null
  throw new BadRequestException('profileId 不能为空');
});
