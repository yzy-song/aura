import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Profile as ProfileModel } from '@aura/database/prisma/client';

export const CurrentProfile = createParamDecorator((data: keyof ProfileModel, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const profile = request.user;
  return data ? profile?.[data] : profile;
});
