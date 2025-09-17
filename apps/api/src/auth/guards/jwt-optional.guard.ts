import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    // 如果没有 Authorization header，则直接放行
    if (!req.headers.authorization) {
      return true;
    }
    // 有 Authorization，则走正常 JWT 校验
    return super.canActivate(context);
  }
}
