import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ProfileId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.headers['x-profile-id'];
});
// 这个装饰器用于从请求头中提取 'x-profile-id'，匿名用户的标识,并将其作为参数传递给控制器方法,
