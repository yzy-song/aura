import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ProfileId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const profileId = request.headers['x-profile-id'];
  return profileId || null; // 如果没有提供 profileId，返回 null 而不是 undefined
});
// 这个装饰器用于从请求头中提取 'x-profile-id'，匿名用户的标识,并将其作为参数传递给控制器方法,
