import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Profile as ProfileModel } from '@aura/database/prisma/client';

export const CurrentProfile = createParamDecorator((data: keyof ProfileModel, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  // 1. 优先从 request.user 中获取由 JwtStrategy 附加的已登录 Profile
  const profile = request.user;

  // 如果是已登录用户，直接返回
  if (profile) {
    return data ? profile?.[data] : profile;
  }

  // 2. 如果不是已登录用户 (request.user 不存在)，则回退到从请求头获取匿名 ID
  //    注意：这里我们只返回 ID，因为匿名用户没有完整的 profile 对象
  const anonymousProfileId = request.headers['x-profile-id'];
  return anonymousProfileId; // 如果两个都没有，则返回 undefined
});
